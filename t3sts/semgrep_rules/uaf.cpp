v8::Local<v8::Promise> uaf(v8::Isolate* isolate) {
  if (!EnsureConnected()) {
    return v8::Local<v8::Promise>();
  }

  v8::MaybeLocal<v8::Promise::Resolver> resolver =
      v8::Promise::Resolver::New(isolate->GetCurrentContext());
  if (resolver.IsEmpty()) {
    return v8::Local<v8::Promise>();
  }

  auto global_context(
      v8::Global<v8::Context>(isolate, isolate->GetCurrentContext()));
  auto promise_resolver(
      v8::Global<v8::Promise::Resolver>(isolate, resolver.ToLocalChecked()));
	// ok: chromium-bind-uaf
  DistillPageText(
      render_frame(),
      base::BindOnce(&PageContentExtractor::OnDistillResult,
                     weak_ptr_factory_.GetWeakPtr(), std::move(callback)));
	// ok: chromium-bind-uaf
  // ruleid: chromium-unretained-uaf
  DistillPageText(
      render_frame(),
      base::BindOnce(&PageContentExtractor::OnDistillResult,
                     base::Unretained(this), std::move(callback)));

  // this is bad and most likely will explode:
  auto func = [](MyClass* c, int val) {
    if (val > 10) {
      c->DoSomething();
    } else {
      c->DoSomethingElse();
    }
  };
  // ruleid: chromium-bind-uaf
  base::BindOnce(&func, this);

  // ok: chromium-bind-uaf
  base::BindOnce(&MyClass::DoSomethingConditionally, weak_ptr_factory_.GetWeakPtr());

  // ok: chromium-unretained-uaf
  web_ui()->RegisterMessageCallback(
      "initLeoAssistant",
      base::BindRepeating(&BraveLeoAssistantHandler::HandleInitLeoAssistant,
                          base::Unretained(this)));

  // ok: chromium-unretained-uaf
  pref_change_registrar_.Add(
      prefs::kEnabled,
      base::BindRepeating(&AdsServiceImpl::OnEnabledPrefChanged,
                          base::Unretained(this)));

  // ok: chromium-unretained-uaf
  receiver_.set_disconnect_handler(
      base::BindOnce(&LoggerImpl::OnError, base::Unretained(this)));

  // ok: chromium-unretained-uaf
  remote_.set_disconnect_handler(
      base::BindOnce(&LoggerImpl::OnError, base::Unretained(this)));

  // ok: chromium-unretained-uaf
  receiver_.set_disconnect_with_reason_handler(
      base::BindOnce(&LoggerImpl::OnError, base::Unretained(this)));

  // ok: chromium-unretained-uaf
  remote_.set_disconnect_with_reason_handler(
      base::BindOnce(&LoggerImpl::OnError, base::Unretained(this)));

  // ok: chromium-unretained-uaf
  timer_.Start(FROM_HERE, base::Seconds(1),
    base::BindRepeating(base::Unretained(this), 42));

}
