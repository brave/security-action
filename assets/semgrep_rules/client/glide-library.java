// ruleid: glide-library
import com.bumptech.glide.load.DataSource;

if (mBraveNewsController != null) {
            mBraveNewsController.getImageData(adImageUrl, imageData -> {
                if (imageData != null) {
                    Bitmap decodedByte =
                            BitmapFactory.decodeByteArray(imageData, 0, imageData.length);
                    // ruleid: glide-library
                    Glide.with(mActivity)
                            .asBitmap()
                            .load(decodedByte)
                            .fitCenter()
                            .priority(Priority.IMMEDIATE)
                            .diskCacheStrategy(DiskCacheStrategy.ALL)
                            .into(new CustomTarget<Bitmap>() {
                                @Override
                                public void onResourceReady(@NonNull Bitmap resource,
                                        @Nullable Transition<? super Bitmap> transition) {
                                    imageView.setImageBitmap(resource);
                                }
                                @Override
                                public void onLoadCleared(@Nullable Drawable placeholder) {}
                            });
                    imageView.setClipToOutline(true);
        }
    });
}
