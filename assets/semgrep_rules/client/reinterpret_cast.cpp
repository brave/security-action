// ruleid: reinterpret_cast
std::string_view der_cert(reinterpret_cast<const char*>(cert->pbCertEncoded), cert->cbCertEncoded);
// ruleid: reinterpret_cast
const uint8_t* string_data =reinterpret_cast<const uint8_t*>(response_body.data());
// ruleid: reinterpret_cast
uint32_t value = *reinterpret_cast<const uint32_t*>(bytes.data());
// ruleid: reinterpret_cast
int rv = PKCS5_PBKDF2_HMAC(mnemonic.data(), mnemonic.length(), reinterpret_cast<const uint8_t*>(salt.data()), salt.length(), 2048, EVP_sha512(),seed->size(), seed->data());
// ruleid: reinterpret_cast
float* float_data = reinterpret_cast<float*>(const_cast<uint8_t*>(data));
// ok: reinterpret_cast
auto orig_fn = reinterpret_cast<GetModuleFileNameExWFunction>(g_originals.functions[GET_MODULE_FILENAME_EX_W_ID]);
