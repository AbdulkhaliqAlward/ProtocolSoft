/** 404 inside the site layout (header and footer stay). Catches notFound()
 *  from every page and unknown path ([...path]); Next adds the 404 status. */
import { LostPanel } from '@/components/LostPanel';

export default function NotFound() {
  return <LostPanel />;
}
