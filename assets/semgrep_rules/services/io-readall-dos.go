func handleBad(w http.ResponseWriter, r *http.Request) []byte {
	// ruleid: io-readall-dos
	payload, _ = io.ReadAll(r.Body)
	return payload
}

func handleOK(w http.ResponseWriter, r *http.Request) []byte {
	r.Body = http.MaxBytesReader(w, r.Body, 123)
	fmt.Print("banana")
	// ok: io-readall-dos
	payload, _ = io.ReadAll(r.Body)
	return payload
}

// ok: io-readall-dos
io.ReadAll(io.LimitReader(r.Body, u.maxRequestSize))

// ok: io-readall-dos
io.ReadAll(x.y)