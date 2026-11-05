// Test cases for mojo-addinterface-privileged-interfaces rule

// SHOULD TRIGGER: privileged interface bound without frame restriction
// ruleid: mojo-addinterface-privileged-interfaces
map->Add<cosmetic_filters::mojom::CosmeticFiltersResources>(
    base::BindRepeating(&BindCosmeticFiltersResources));
// ruleid: mojo-addinterface-privileged-interfaces
map->Add<misc_metrics::mojom::Web3Metrics>(base::BindRepeating(&BindWeb3Metrics));
// ruleid: mojo-addinterface-privileged-interfaces
associated_registry.AddInterface<CosmeticFiltersResources>(
    base::BindRepeating(&BindCosmeticResources, &render_frame_host));

// SHOULD NOT TRIGGER: interfaces with their own receiver-side checks
// ok: mojo-addinterface-privileged-interfaces
registry.AddInterface<blink::mojom::BadgeService>(std::move(receiver));
// ok: mojo-addinterface-privileged-interfaces
registry.AddInterface<playlist::mojom::PlaylistMediaResponder>(base::BindRepeating(
    &playlist::PlaylistMediaHandler::BindMediaResponderReceiver,
    &render_frame_host));