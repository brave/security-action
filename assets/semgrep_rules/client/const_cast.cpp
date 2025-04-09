// ruleid: const_cast
auto* browser = const_cast<Browser*>(tab->controller()->GetBrowser());

// ruleid: const_cast
const_cast<RedirectInfo&>(redirect_info).new_referrer = capped_referrer.spec();
