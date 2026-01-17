const categories = [
  'Category 1',
  'Category 2',
  'Category 3',
  'Category 4',
  'Category 5',
];

const subcategories = [
  'Subcategory 1',
  'Subcategory 2',
  'Subcategory 3',
];

const contentItems = [
  'Content Item 1',
  'Content Item 2',
  'Content Item 3',
  'Content Item 4',
  'Content Item 5',
];

export function BarrelSidebar() {
  // Create a grid with 5 rows, aligning all highlighted items on row 3 (index 2)
  const rows = [
    [categories[0], subcategories[0], contentItems[0]],
    [categories[1], subcategories[1], contentItems[1]],
    [categories[2], subcategories[2], contentItems[2]], // Highlighted row
    [categories[3], subcategories[3], contentItems[3]],
    [categories[4], subcategories[4], contentItems[4]],
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-8">
          {row.map((item, colIndex) => (
            <div
              key={colIndex}
              className={`flex-1 cursor-pointer transition-all duration-200 ${
                rowIndex === 2
                  ? 'text-emerald-400 opacity-100'
                  : rowIndex === 1 || rowIndex === 3
                  ? 'text-gray-400 opacity-70 hover:opacity-90'
                  : 'text-gray-500 opacity-40 hover:opacity-60'
              }`}
            >
              {item || ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
