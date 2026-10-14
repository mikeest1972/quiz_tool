export function Figure({ src, alt }: { src: string; alt: string }) {
  return <img className="figure" src={`${import.meta.env.BASE_URL}${src}`} alt={alt} />;
}
