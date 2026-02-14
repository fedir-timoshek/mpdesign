import Link from "next/link";
import { Product, Locale } from "@/types/content";
import { localizedCategoryInfo } from "@/lib/site-config";

type Props = {
  product: Product;
  locale: Locale;
};

export function ProductCard({ product, locale }: Props) {
  const labels = localizedCategoryInfo[locale];

  return (
    <article className="product-card">
      <Link href={`/${locale}/products/${product.slug}`} className="product-card-link">
        <div className="product-image-shell">
          <img
            src={product.heroImage.src}
            alt={product.heroImage.alt[locale]}
            loading="lazy"
          />
        </div>
        <div className="product-card-content">
          <h3>{product.title[locale]}</h3>
          <p>{product.subtitle[locale]}</p>
          <span>{labels.cardAction}</span>
        </div>
      </Link>
    </article>
  );
}
