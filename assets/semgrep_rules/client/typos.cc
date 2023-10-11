  // ok: raptor-typos
  if (auto* playlist_service =
          playlist::PlaylistServiceFactory::GetForBrowserContext(
              web_contents->GetBrowserContext())) {
    playlist_service->ConfigureWebPrefsForBackgroundWebContents(web_contents,
                                                                web_prefs);
  }

  if (host_content_settings_map) {
    // ok: raptor-typos
    if (std::unique_ptr<content::NavigationThrottle>
            domain_block_navigation_throttle = brave_shields::
                DomainBlockNavigationThrottle::MaybeCreateThrottleFor(
                    handle, g_brave_browser_process->ad_block_service(),
                    g_brave_browser_process->ad_block_service()
                        ->custom_filters_provider(),
                    EphemeralStorageServiceFactory::GetForContext(context),
                    host_content_settings_map,
                    g_browser_process->GetApplicationLocale())) {
      throttles.push_back(std::move(domain_block_navigation_throttle));
    }
  }

content::StoragePartitionConfig
BraveContentBrowserClient::GetStoragePartitionConfigForSite(
    content::BrowserContext* browser_context,
    const GURL& site) {
  // ok: raptor-typos
  if (auto* request_otr_service =
          request_otr::RequestOTRServiceFactory::GetForBrowserContext(
              browser_context)) {
    if (request_otr_service->IsOTR(site)) {
      CHECK(site.has_host());  // upstream also does this before accessing
                               // site.host()
      return content::StoragePartitionConfig::Create(
          browser_context, site.host(), /*partition_name=*/"request_otr",
          /*in_memory=*/true);
    }

  // ruleid: raptor-typos
  if (request_otr_service =
          request_otr::RequestOTRServiceFactory::GetForBrowserContext(
              browser_context)) {
    if (request_otr_service->IsOTR(site)) {
      CHECK(site.has_host());
    }


  }

  return ChromeContentBrowserClient::GetStoragePartitionConfigForSite(
      browser_context, site);
}
