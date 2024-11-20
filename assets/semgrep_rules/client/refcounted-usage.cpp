// ruleid: refcounted-usage
class MyClass : public base::RefCounted<MyClass> {
};

// ruleid: refcounted-usage
class ThreadSafeClass : public base::RefCountedThreadSafe<ThreadSafeClass> {
};

// ruleid: refcounted-usage
base::RefCountedData<int> shared_integer(42);

// ok: refcounted-usage
class RegularClass {
};

// ruleid: refcounted-usage
using MyRefCountedType = base::RefCounted<SomeType>;

// ok: refcounted-usage
std::shared_ptr<MyClass> better_alternative; 

// ruleid: refcounted-usage
class NestedRefCounted : public base::RefCountedThreadSafe<NestedRefCounted> {
    // ruleid: refcounted-usage
    base::RefCountedData<std::string> nested_data_;
};
