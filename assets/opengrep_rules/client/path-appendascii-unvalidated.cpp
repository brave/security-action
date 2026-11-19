// Test cases for path-appendascii-unvalidated rule

// SHOULD TRIGGER: non-constant name/id composed into a path
// ruleid: path-appendascii-unvalidated
ads_service_path_.AppendASCII(name);
// ruleid: path-appendascii-unvalidated
base::FilePath item_dir = GetPlaylistItemDirPath().AppendASCII(item_id);
// ruleid: path-appendascii-unvalidated
base_dir_.AppendASCII(user_supplied_id).AppendASCII("thumbnail.png");
// ruleid: path-appendascii-unvalidated
profile_dir.AppendASCII(background_url_piece);

// SHOULD NOT TRIGGER: constant strings / kConstant names are validated by construction
// ok: path-appendascii-unvalidated
ads_service_path_.AppendASCII(kClientJsonFilename);
// ok: path-appendascii-unvalidated
base_dir_.AppendASCII("thumbnail.png");
// ok: path-appendascii-unvalidated
base_dir_.AppendASCII(kThumbnailExtension);