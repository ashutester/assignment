import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Time Keeper/);
});

test('Verify Local(You) record exists be default and should not be deleted', async ({ page }) => {
  await page.goto('localhost:3000');
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Time Keeper/);
  
  // The Local row: label cell contains "Local" and the "(You)" marker
  const localRow = page.getByRole('row').filter({ hasText: 'Local(You)' });
  await expect(localRow).toBeVisible();

  // Determine the browser/system timezone the app is using
  const timeZone = await page.evaluate(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Compute expected current time in that zone, matching the app's format ("2:55 PM")
  const expected = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());

  // The Local Time value is the 3rd cell
  await expect(localRow.locator('td:nth-child(3)')).toHaveText(expected);
  await localRow.getByRole('button', { name: 'Delete' }).click();
  
  // Checking the row exists even after user deletes and reloads the page.
  await page.reload();
  await expect(localRow).toBeVisible();

});

test('Verify that time zone record is getting created', async ({ page }) => {
  await page.goto('localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Time Keeper/);

  await page.getByRole('button', { name: 'Add timezone' }).click();
  const userTextBox  = page.getByRole('textbox', { name: 'Label' })
                        .or(page.getByPlaceholder('Label'))
  await userTextBox.fill('Calgary time');
  await page.locator('#timezone').selectOption({ label: 'Mountain Standard Time' });  
  await page.getByRole('button', { name: 'Save' }).click();

   // Find the row by its label text
  const row = page.getByRole('row').filter({ hasText: 'Calgary time' });
  await expect(row).toBeVisible();

  // Verify the timezone label cell
  await expect(row.getByText('America/Denver')).toBeVisible();

  // Compute current Mountain Time in the same format the app uses: "3:43 PM"
  const expected = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Denver',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());

  // The time is the 3rd <td>. Scope to cells and pick by index.
  const cells = row.getByRole('cell');
  await expect(cells.nth(2)).toHaveText(expected);

});

// Not adding test cases for avoiding duplicate record creation as it is low priority. Bug already exists for sort order. 

