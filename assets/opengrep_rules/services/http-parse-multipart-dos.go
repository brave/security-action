func handleBad(w http.ResponseWriter, r *http.Request) error {
	// ruleid: http-parse-multipart-dos
	if err = r.ParseMultipartForm(maxSize); err != nil {
		return err
	}
	return nil
}

func handleOK(w http.ResponseWriter, r *http.Request) error {
	r.Body = http.MaxBytesReader(w, r.Body, 123)
	fmt.Print("banana")
	// ok: http-parse-multipart-dos
	if err = r.ParseMultipartForm(maxSize); err != nil {
		return err
	}
	return nil
}