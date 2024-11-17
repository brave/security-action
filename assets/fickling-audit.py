import fickling
from fickling.fickle import PickleDecodeError, EmptyPickleError

from os import environ, path
import sys

def is_pickle_unsafe(file_path):
    try:
        return not fickling.is_likely_safe(file_path)
    except (NotImplementedError, PickleDecodeError, EmptyPickleError):
        return False
    except Exception as e:
        # print exception on stderr
        print("%s: (%s) %s" % (e.__class__.__qualname__, file_path, e), file=sys.stderr)
        return False

def main():
    with open(path.join(environ["SCRIPTPATH"], "all_changed_files.txt")) as all_changed_files:
        all_changed_files = [f for f in all_changed_files.read().split("\x00")]

        for f in all_changed_files:
            if is_pickle_unsafe(f):
                print("""M:%s:0 This pickle might contain unsafe contructs\n""" % (f))

if __name__ == "__main__":
    main()