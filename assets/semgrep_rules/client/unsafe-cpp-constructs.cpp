// ruleid: unsafe_cpp_constructs
UNSAFE_BUFFERS(data());
// ruleid: unsafe_cpp_constructs
UNSAFE_TODO(base::make_span(&web_script_source, 1u));
// ruleid: unsafe_cpp_constructs
std::next(it);
// ruleid: unsafe_cpp_constructs
std::advance(cert_iter, cert_idx);
// ruleid: unsafe_cpp_constructs
std::prev(it);
// ruleid: unsafe_cpp_constructs
const void* const kUserDataKey = &kUserDataKey;
// ok: unsafe_cpp_constructs
static void RegisterCallback(AtExitCallbackType func, uint8_t param);
