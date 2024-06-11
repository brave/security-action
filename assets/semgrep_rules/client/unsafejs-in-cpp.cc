int main() {
  // ruleid: unsafe-js-in-cpp-strings
  const std::string kGetContentLength = "document.body.innerHTML.length";

  const std::string kGetStyleLength =
  // ruleid: unsafe-js-in-cpp-strings
      "document.getElementById('brave_speedreader_style').innerHTML.length"; 
  // ruleid: unsafe-js-in-cpp-strings
  const std::string altDot = "asd.document.write";
}