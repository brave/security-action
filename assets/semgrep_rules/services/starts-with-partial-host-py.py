# ruleid: starts-with-partial-host-py
my_urI[0].startswith("https://x.y")

# ruleid: starts-with-partial-host-py
request.url.startswith('https://example.com')

# ruleid: starts-with-partial-host-py
url.startswith('http://127.0.0.1:')

# ok: starts-with-partial-host-py
url.startswith("https://ba.na/x")

# ok: starts-with-partial-host-py
url.startswith("https://")

# ok: starts-with-partial-host-py
url.startswith("xyz://abc/https://def")