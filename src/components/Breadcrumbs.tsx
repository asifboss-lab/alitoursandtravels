import { Link } from 'react-router-dom';

interface BreadcrumbsProps {
  trail: { name: string; path: string }[];
}

/**
 * Breadcrumb trail. The current page is the last item and is marked with
 * aria-current rather than rendered as a link to itself.
 */
export function Breadcrumbs({ trail }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={item.path}>
              {isLast ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link to={item.path}>{item.name}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
