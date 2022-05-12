import { DotnetTemplate } from '../models';

/**
 * Expected input is from running `dotnet new --list`.
 * It should look something like below.
 *
 * Templates            Short Name       Languages
 * ---------------      -----------      ------------
 * ASP.NET Core         aspnetcore       C#
 *
 * We can parse this syntax based on the separator row. We
 * know the separators are hyphens (-), with spaces between each column.
 * Since the hyphens cover the length of the longest value, we can use the
 * index of the first hyphen underneath each field to index the fields.
 *
 * For example, above the first hyphen under "Short Name" is in position 21,
 * and the first hyphen under "Languages" is 39. This means that the values
 * for "Short Name" must be found on each line between characters 21 and 39.
 *
 * So, for each line the value of shortName is line.substring(21, 39).trim()
 *
 * @param rawOutput The output from running `dotnet new --list`
 * @retrurn Array of available templates found in raw output
 */
export function parseDotnetNewListOutput(rawOutput: string): DotnetTemplate[] {
  const lines = rawOutput.split('\n').filter((x) => !!x);

  // The separator row is used to index fields. It may be the first row, or
  // if search values are provided it could be the third row.
  const sepLineIdx = lines.findIndex((line) => line.startsWith('----'));
  if (!sepLineIdx) {
    throw new Error('Unable to parse `dotnet new --list` output');
  }
  const sepLine = lines[sepLineIdx];

  // We know the separators are hyphens (-), with spaces between each column.
  // We want to find the index of the first hyphen underneath each field.
  const columnIndicies: number[] = [];
  let check = true;
  for (let i = 0; i < sepLine.length; i++) {
    // First hyphen in a group
    if (sepLine[i] === '-' && check) {
      columnIndicies.push(i);
      // Don't check until again until a non-hyphen character is found.
      check = false;
    } else if (sepLine[i] !== '-') {
      check = true;
    }
  }

  // Column headers are directly above the separator
  const fieldLine = lines[sepLineIdx - 1];
  const fields = columnIndicies.map((start, idx) => {
    // Values end at the beginning of the next column, or the end of the line
    const end = columnIndicies[idx + 1] || fieldLine.length;
    return {
      start,
      end,
      name: fieldLine.substring(start, end).trim(),
    };
  });

  // For each line
  return lines.slice(sepLineIdx + 1).map((l) =>
    // Construct an object from its fields
    fields.reduce((obj, field) => {
      const value = l.slice(field.start, field.end).trim();
      // Map field name + value into expected form
      if (field.name === 'Short Name') {
        obj.shortNames = value.split(',');
      } else if (field.name === 'Template Name' || field.name === 'Templates') {
        obj.templateName = value;
      } else if (field.name === 'Language') {
        obj.languages = value.replace(/[[\]]/g, '').split(',');
      } else if (field.name === 'Tags') {
        obj.tags = value.split('/');
      }
      return obj;
    }, {} as DotnetTemplate),
  );
}
