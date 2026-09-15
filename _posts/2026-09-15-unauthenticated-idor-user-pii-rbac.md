---
title: "How I Found an Unauthenticated IDOR That Exposed Every User's PII and Access Roles"
date: 2026-09-15 00:00:00 +0545
categories: [Bug Bounty , IDOR]
tags: [idor, cybersecurity, infosec, api, bug bounty]
media_subpath: /assets/posts/idor/
---
Everyone’s out here chasing live targets. Meanwhile I’m digging through an archived repo nobody’s touched in months, because why not. *So naturally that’s where I went looking.*

Turned out to be worth it.

— — — — — — — — — — — — — — — — — — — — — — — — — — — — — 

Let’s call it example.com

The program listed the API repo as in-scope source, even though it’s archived on GitHub now. Archived repos are honestly slept on — no live env to babysit, no WAF, no rate limits, just you and the code. So I started reading through the permission views.

I landed on `api/permission/views/user.py` and noticed the view class never sets `permission_classes`.

Why that matters: in Django REST Framework, if a view skips `permission_classes` AND the project's settings.py has no `DEFAULT_PERMISSION_CLASSES` set, DRF just defaults to `AllowAny`. Checked settings.py, no default was set either. So this view was wide open by accident.

The `retrieve` method just takes a raw `pk` from the URL and returns that user's full profile. No auth check. No ownership check. Nothing.

Tested it straight away:

```http
GET /api/v1/permission/user/1/ HTTP/1.1
Host: localhost:8000
```

No token, no cookie, no login. Got back:

```json
{
  "user": {
    "username": "user.one",
    "email": "user.one@example.com",
    "first_name": "user",
    "last_name": "one"
  },
  "groups": [],
  "permissions": []
}
```

Bumped the pk to 2 out of curiosity and it got way better (worse):

```json
{
  "user": {
    "username": "user.two",
    "email": "user.two@example.com",
    "first_name": "user",
    "last_name": "one"
  },
  "groups": ["bureau_ao"],
  "permissions": [
    "bidding.add_bid",
    "bidding.change_bid",
    "bidding.view_bid",
    "position.add_position",
    "position.change_position"
  ]
}
```

So now it’s not just leaking PII, it’s literally telling you which pk belongs to a privileged role and what that role can do. You don’t even have to guess who the good targets are, the API just tells you.

Wrote a quick script to loop through pk values and confirmed it enumerates cleanly, no rate limiting, no anomaly, nothing stopping you. Walked through 15 accounts without a single hiccup.

Here’s the flow start to finish:

![Attacker Flow](attack_flow.png)

Why this one felt bigger than a normal IDOR:

* full names, work emails, usernames for every employee, just by walking an integer
* group names + permission codenames leaked in the same response = free RBAC map
* clean list of verified work emails = phishing/credential stuffing material
* for a govt agency handling personnel data, this isn’t just “oops PII leak,” it’s a compliance problem too

Fix is small, as usual:

```python
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied
```

```python
class UserPermissionView(FieldLimitableSerializerMixin, ViewSet):
    permission_classes = (IsAuthenticated,)    def retrieve(self, request, pk=None, format=None):
        profile = get_object_or_404(UserProfile, id=pk)
        if request.user != profile.user and not request.user.is_staff:
            raise PermissionDenied
        return Response(
            self.construct_return_object(profile.user),
            status=status.HTTP_200_OK,
        )
```

Just add the permission class + an ownership check. That’s it. Don’t rely on a global DEFAULT_PERMISSION_CLASSES to save views that never declare their own — one missing line and the whole thing falls back to AllowAny.

Reported it through the program on HackerOne with source code refs, terminal output, an enum script, and the diagram above.

A couple days later it got closed as a Duplicate of a report from like 6 months earlier.

![Report](report.png)

So yeah, the bug’s real, someone found it before me. Not every finding turns into a bounty, but the bug doesn’t stop being a bug just because it got closed as a dupe. Figured it was worth writing up anyway.

If you reached here, thanks for reading.

Happy Hacking !!
