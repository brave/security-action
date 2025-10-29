int main() {
    // ok: cast-signed-to-unsigned
    int y = 42;
    // ruleid: cast-signed-to-unsigned
    uint x = (uint)y;

    return 0;
}
