// Test cases for decode-url-escape-into-path rule (taint: decode -> path Append)

// SHOULD TRIGGER: decoded URL component composed into a file path
// ruleid: decode-url-escape-into-path
sanitized_path.Append(background_url_piece.DecodeUrlEscapeSequences());
// ruleid: decode-url-escape-into-path
target.Append(base::UnescapeURLComponent(encoded, UnescapeRule::PATH_SEPARATORS));
// ruleid: decode-url-escape-into-path
dir.Append(DecodeUrlEscapeSequences(value));

// SHOULD NOT TRIGGER: decoding used for display / non-path uses
// ok: decode-url-escape-into-path
title = background_url_piece.DecodeUrlEscapeSequences();
// ok: decode-url-escape-into-path
AppendEscapedString(&out, background_url_piece.DecodeUrlEscapeSequences());