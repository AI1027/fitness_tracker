import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  resultKey: string;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  endpoint,
  resultKey,
  emptyText,
  renderItem,
}: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setItems(null);
    setError('');

    getJson<Record<string, T[]>>(endpoint)
      .then((result) => {
        if (active) setItems(result[resultKey] ?? []);
      })
      .catch(() => {
        if (active) setError('Unable to load data');
      });

    return () => {
      active = false;
    };
  }, [endpoint, resultKey]);

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
