# Async image exact-size customization

This branch adds exact pixel dimensions for images generated through the built-in `sub2api (async)` provider. It was first deployed against upstream v0.8.0.

## Behavior

- The async request keeps its `size` parameter and adds the selected aspect ratio to the prompt.
- If the returned image already matches the selected dimensions, it is saved unchanged.
- Otherwise, the browser scales and center-crops the returned image before saving and downloading it. The resulting local image matches the selected pixel dimensions exactly.
- The original image stored by Sub2API is not modified. Existing images are not processed retroactively.

## Updating from upstream

1. Compare the new upstream image and async-provider behavior. If upstream now guarantees exact dimensions, decide whether this customization is still needed.
2. Merge the new upstream release into this branch and resolve any conflicts in `src/lib/canvasImage.ts`, `src/lib/size.ts`, `src/lib/openaiCompatibleImageApi.ts`, and `src/store.ts`.
3. Run `npm run build` and `npm test`, then generate a new async image for each dimension that matters. Check the downloaded file's pixel dimensions.
4. Build a new Docker image from this branch. Update only the application's image reference in the existing Compose file, preserving its ports, volumes, environment, and other services.

The v0.8.0 deployment patch and instructions are saved outside this repository in the original Codex workspace's `outputs` directory. A patch made for v0.8.0 should not be applied blindly to a later release.
