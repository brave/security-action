#ifdef UNSAFE_BUFFERS_BUILD
// TODO(): Remove this and
// convert code to safer constructs.
// ruleid: unsafe_cpp_constructs
#pragma allow_unsafe_buffers
#endif
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
