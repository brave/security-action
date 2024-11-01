// ruleid: dangling-pointer-trait
raw_ptr<BrowserView, DanglingUntriaged> browser_view_ = nullptr;
// ruleid: dangling-pointer-trait
raw_ptr<content::WebContents, DisableDanglingPtrDetection> actual_ui_web_contents_ = nullptr;
// ruleid: dangling-pointer-trait
const raw_ptr<Delegate, FlakyDanglingUntriaged> delegate_;
// ruleid: dangling-pointer-trait
raw_ptr<ImageContextImpl, AcrossTasksDanglingUntriaged> context_ = nullptr;
// ruleid: dangling-pointer-trait
raw_ptr<MachPortsExtraHeader, AllowPtrArithmetic> mach_ports_header_ = nullptr;
// ruleid: dangling-pointer-trait
raw_ptr<Test, AllowUninitialized> test;
// ruleid: dangling-pointer-trait
raw_ptr<TestAshTraceDestinationIORegistry::IOStatus, LeakedDanglingUntriaged> status_;
// ruleid: dangling-pointer-trait
std::vector<raw_ptr<views::View, VectorExperimental>> panes;
// ruleid: dangling-pointer-trait
for (std::set<raw_ptr<aura::Window, SetExperimental>>::iterator iter =
           removed_windows.begin();
       iter != removed_windows.end(); ++iter) {
    WindowState::Get(*iter)->Unminimize();
    RemoveObserverIfUnreferenced(*iter);
}
// ruleid: dangling-pointer-trait
outgoing_queue_ = std::queue<raw_ptr<FakeV4L2Buffer, CtnExperimental>>();
// ruleid: dangling-pointer-trait
const raw_ref<const AppListConfig, DanglingUntriaged> app_list_config_;
// ruleid: dangling-pointer-trait
const raw_ref<base::WaitableEvent, AcrossTasksDanglingUntriaged> on_destroyed_;
// ruleid: dangling-pointer-trait
const raw_ref<AshProxy, LeakedDanglingUntriaged> ash_;
