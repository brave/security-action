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
    
    // SHOULD TRIGGER: base::RandBytesAsVector (need security review)
    // ruleid: chromium-cryptography-random-usage
    std::vector<uint8_t> random_bytes = base::RandBytesAsVector(16);
  }
  
  void CryptographicUsage() {
    // SHOULD TRIGGER: Cryptographic random functions (need security review)
    uint8_t crypto_buffer[32];
    // ruleid: chromium-cryptography-random-usage
    crypto::RandBytes(crypto_buffer, sizeof(crypto_buffer));
    
    // SHOULD TRIGGER: crypto::RandBytesAsVector (need security review)
    // ruleid: chromium-cryptography-random-usage
    std::vector<uint8_t> crypto_vector = crypto::RandBytesAsVector(32);
    
    // SHOULD TRIGGER: crypto::RandBytesAsArray (need security review)
    // ruleid: chromium-cryptography-random-usage
    std::array<uint8_t, 16> crypto_array = crypto::RandBytesAsArray<16>();
    
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
    
    // SHOULD TRIGGER: Additional STL random engine types
    // ruleid: chromium-cryptography-random-usage
    std::mt19937_64 gen64;
    // ruleid: chromium-cryptography-random-usage
    std::minstd_rand minstd;
    // ruleid: chromium-cryptography-random-usage
    std::minstd_rand0 minstd0;
    // ruleid: chromium-cryptography-random-usage
    std::ranlux24 ranlux24_gen;
    // ruleid: chromium-cryptography-random-usage
    std::ranlux48 ranlux48_gen;
    // ruleid: chromium-cryptography-random-usage
    std::ranlux24_base ranlux24_base_gen;
    // ruleid: chromium-cryptography-random-usage
    std::ranlux48_base ranlux48_base_gen;
    // ruleid: chromium-cryptography-random-usage
    std::knuth_b knuth_gen;
    // ruleid: chromium-cryptography-random-usage
    std::seed_seq seed;
    // ruleid: chromium-cryptography-random-usage
    std::linear_congruential_engine<unsigned int, 1, 0, 10> lce;
    // ruleid: chromium-cryptography-random-usage
    std::mersenne_twister_engine<unsigned int, 32, 624, 397, 31, 0x9908b0df> mte;
    // ruleid: chromium-cryptography-random-usage
    std::subtract_with_carry_engine<unsigned int, 24, 10, 24> swce;
    // ruleid: chromium-cryptography-random-usage
    std::discard_block_engine<std::ranlux24_base, 223, 23> dbe;
    // ruleid: chromium-cryptography-random-usage
    std::independent_bits_engine<std::mt19937, 10, unsigned int> ibe;
    // ruleid: chromium-cryptography-random-usage
    std::shuffle_order_engine<std::mt19937, 256> soe;
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