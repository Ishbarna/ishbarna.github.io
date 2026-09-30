---

title: "Animals with a Base64 String to Unauthenticated SQL Injection (Intigriti Challenge-0926)"

date: 2026-09-23 00:00:00 +0545

categories: [CTF, Intigriti Challange-0926]

tags: [cybersecurity, ctf, intigriti, sql-injection,challange 0926]

media_subpath: /assets/posts/CTF/Challange-0926/

 
---
Intigriti’s September Challenge : Challenge 0926

![Challenge](cover.png)

I almost skipped this challenge. Intigriti’s Challenge 0926 was just a page that showed you a picture of an animal based on a URL parameter. Doesn’t sound like much. Turns out, that one little parameter had a full unauthenticated SQL injection hiding in it and it took me straight to the flag.

> **Challenge:** [Intigriti Challenge 0926](https://challenge-0926.challenges.intigriti.io/)

Here’s the story of how I found it, broken down in plain terms.

## First look

The endpoint was pretty minimal:

```text
https://challenge-0926.challenges.intigriti.io/challenge.php?pic=<BASE64_PAYLOAD>
```

The thing that caught my attention wasn’t the app itself, it was that the parameter was encoded at all. I’ve seen this pattern before, and honestly it’s kind of a tell. Developers sometimes add a Base64 layer thinking it gives them some kind of protection, like it’s harder for an attacker to mess with. It’s not. It’s literally just text written differently. Takes two seconds to decode, edit, and re-encode. So instead of assuming anything, I just wanted to see what actually happens to that value once it hits the server.

## Testing the input

I grabbed the plaintext `fox`, stuck a single quote on the end so it became `fox'`, and encoded that instead. Sent it off. Something broke. Not a full crash, but the response was clearly off from what I'd gotten before.

That’s usually the first hint, so I ran a quick check to make sure it wasn’t just noise:

`fox' AND '1'='1'` gave me the normal description back.
`fox' AND '1'='2'` gave me nothing.

Same request structure, different logical outcome, different result. That’s about as clean a signal as you’ll get that the decoded value is landing straight in a SQL query with zero filtering.

## Digging deeper

Once I knew injection was live, next thing I needed was the column count, since I wanted to pull data out with a UNION SELECT and those need to line up properly.

```sql
zzq' UNION SELECT 'C1'--
```

Worked right away. One column. Honestly made the rest of this way easier than I expected.

From there I just asked the database to give up its own table names:

```sql
zzq' UNION SELECT group_concat(table_name) FROM information_schema.tables WHERE table_schema=database()--
```

Got back `animals`, which tracks, and `secret_vault`, which absolutely does not belong on a page about fox pictures. That name alone tells you everything.

## The flag

```sql
zzq' UNION SELECT note FROM secret_vault--
```

Sent it, refreshed, and there it was sitting in the same box where the fox description usually shows up:

![Flag](Flag.png)

No login screen, no session cookie, nothing standing in the way. Just a parameter that trusted its own encoding a bit too much.

## Why I think this happened

I don’t think this was a case of someone being careless, I think it’s more that Base64 gets mistaken for a security measure way more often than it should be. It’s not encryption. It’s not validation. It’s just a different way of writing the same bytes. The moment the server decodes it back into plain text, it’s exactly as dangerous as if you’d sent the raw string in the first place. In this case, that decoded value went straight into a query with no parameterization, so the whole thing was wide open to anyone who bothered to check.

This isn’t just a CTF-only mistake either. I’ve seen encoded parameters get less scrutiny in real applications too, mostly because people assume “it’s encoded, so it’s probably fine.” That assumption is exactly what makes these bugs slip through.

## What would’ve fixed this

Honestly, not much. A prepared statement instead of string concatenation would’ve killed this entirely:

```php
$stmt = $pdo->prepare('SELECT description FROM animals WHERE name = ?');
$stmt->execute([$name]);
```

Beyond that, a simple allowlist check on the decoded animal name would’ve closed the door too, since there’s only ever a handful of valid values anyway. And obviously, don’t let the database account have more access than it actually needs.

## Wrapping up

What I liked about this one is that it’s a good reminder to not judge an input by how it looks on the surface. Encoded, obfuscated, whatever, none of that tells you anything about what happens once it’s decoded on the server. Test the real value underneath, because that’s what your backend is actually working with, and that’s what any attacker will be testing too.

![Challenge](swag.png)

Room’s here if you want to try it yourself: [challenge-0926.challenges.intigriti.io](https://challenge-0926.challenges.intigriti.io/)

Thanks for reading .

Happy Hacking !!
