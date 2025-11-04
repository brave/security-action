// Test cases for cryptography-random-usage rule
#include <cstdlib>
#include <random>
#include "base/rand_util.h"
#include "crypto/random.h"
#include "third_party/boringssl/src/include/openssl/rand.h"
#include "third_party/boringssl/src/include/openssl/evp.h"

class CryptoUsageExamples {
 public:
  void BadRandomUsage() {
    // SHOULD TRIGGER: Weak C-style random functions (insecure)
    // ruleid: chromium-cryptography-random-usage
    int weak_random1 = rand();
    // ruleid: chromium-cryptography-random-usage
    srand(time(nullptr));
    // ruleid: chromium-cryptography-random-usage
    int weak_random2 = random();
    // ruleid: chromium-cryptography-random-usage
    srandom(12345);
    
    // SHOULD TRIGGER: C++ std random functions (potentially weak)
    // ruleid: chromium-cryptography-random-usage
    int weak_random3 = std::rand();
    // ruleid: chromium-cryptography-random-usage
    std::srand(42);
  }
  
  void ChromiumRandomUsage() {
    // SHOULD TRIGGER: Chromium random functions (need security review)
    // ruleid: chromium-cryptography-random-usage
    int random_int = base::RandInt(1, 100);
    // ruleid: chromium-cryptography-random-usage
    uint64_t random_uint64 = base::RandUint64();
    
    uint8_t buffer[32];
    // ruleid: chromium-cryptography-random-usage
    base::RandGenerator(sizeof(buffer));
  }
  
  void CryptographicUsage() {
    // SHOULD TRIGGER: Cryptographic random functions (need security review)
    uint8_t crypto_buffer[32];
    // ruleid: chromium-cryptography-random-usage
    crypto::RandBytes(crypto_buffer, sizeof(crypto_buffer));
    
    // SHOULD TRIGGER: OpenSSL random functions (need security review)
    uint8_t ssl_buffer[16];
    // ruleid: chromium-cryptography-random-usage
    RAND_bytes(ssl_buffer, sizeof(ssl_buffer));
    
    // SHOULD TRIGGER: Encryption/Decryption operations (need security review)
    // ruleid: chromium-cryptography-random-usage
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    // ruleid: chromium-cryptography-random-usage
    EVP_EncryptInit(ctx, EVP_aes_256_gcm(), key_, iv_);
    // ruleid: chromium-cryptography-random-usage
    EVP_DecryptInit(ctx, EVP_aes_256_gcm(), key_, iv_);
  }
  
  void BadStdRandomUsage() {
    // SHOULD TRIGGER: std::random engines/generators are banned per Chromium style guide
    // Use base::RandomBitGenerator instead
    // ruleid: chromium-cryptography-random-usage
    std::random_device rd;
    // ruleid: chromium-cryptography-random-usage
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(1, 6);
    int dice_roll = dis(gen);

    // ruleid: chromium-cryptography-random-usage
    std::default_random_engine engine;
  }

  void AcceptableUsage() {
    // SHOULD NOT TRIGGER: Correct usage with base::RandomBitGenerator
    base::RandomBitGenerator rng;
    std::uniform_int_distribution<> dis(1, 6);
    int dice_roll = dis(rng);

    // SHOULD NOT TRIGGER: Hash functions (different security concern)
    std::hash<std::string> hasher;
    size_t hash = hasher("some string");

    // SHOULD NOT TRIGGER: Time-based operations
    auto now = std::chrono::steady_clock::now();
    auto timestamp = now.time_since_epoch().count();
  }
  
  void TestHelperUsage() {
    // This would be excluded by test path filter
    // ruleid: chromium-cryptography-random-usage
    int test_random = rand();  // OK in tests
  }
  
 private:
  uint8_t key_[32] = {};
  uint8_t iv_[16] = {};
};