void ConfigureFactory(Profile* profile) {
  // ruleid: system-network-context
  auto* context = SystemNetworkContextManager::GetInstance()->GetContext();

  // ruleid: system-network-context
  auto factory = g_browser_process->system_network_context_manager()
                     ->GetSharedURLLoaderFactory();

  // ruleid: system-network-context
  auto shared = g_browser_process->shared_url_loader_factory();

  // ok: system-network-context
  auto* partition = profile->GetDefaultStoragePartition();

  // ok: system-network-context
  auto own = partition->GetURLLoaderFactoryForBrowserProcess();
}
