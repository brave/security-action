// ruleid: io-readall-dos
io.ReadAll(r.Body)

// ok: io-readall-dos
io.ReadAll(http.MaxBytesReader(w, r.Body, u.maxRequestSize))

// ok: io-readall-dos
io.ReadAll(x.y)