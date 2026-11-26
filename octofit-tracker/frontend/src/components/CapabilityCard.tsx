import type { ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  emptyText: string;
  items: T[] | null;
  error: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  emptyText,
  items,
  error,
  renderItem,
}: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert" className="text-danger">{error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {items.map((item, index) => (
              <li className="mb-2" key={index}>{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
