export default function Page({ params }) {
  const { year, term } = params;

  return (
    <div>
      <h1>Projects for {year} - {term}</h1>
      <p>Here you can find all projects for the year {year} and term {term}.</p>
    </div>
  );
}