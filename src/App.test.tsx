import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/mocks/server';
import { App } from './App';
import '@testing-library/jest-dom/vitest';

describe('App.tsx', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  afterEach(() => {
    server.resetHandlers();
    cleanup();
  });

  test('未入力のとき、送信ボタンはdisabled', async () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'チェック' })).toBeDisabled();
  });

  test('パッケージ名を入力するとdisabled', async () => {
    render(<App />);
    await userEvent.type(
      screen.getByRole('textbox', {
        name: 'パッケージ名',
      }),
      'hono',
    );
    expect(screen.getByRole('button', { name: 'チェック' })).not.toBeDisabled();
  });

  test('送信するとパッケージの情報を表示する', async () => {
    render(<App />);

    await userEvent.type(
      screen.getByRole('textbox', {
        name: 'パッケージ名',
      }),
      'hono',
    );
    await userEvent.click(screen.getByRole('button', { name: 'チェック' }));

    await waitFor(() => {
      const dts = screen.getAllByRole('term');
      const dds = screen.getAllByRole('definition');

      expect(dts).toHaveLength(3);
      expect(dds).toHaveLength(3);

      expect(screen.getByText('v4.0.10')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'npm' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'pkg-size' }),
      ).toBeInTheDocument();

      expect(dts[0].textContent).toBe('週間ダウンロード数');
      expect(dds[0].textContent).toBe('143,796');
      expect(dts[1].textContent).toBe('最新バージョンのリリース日');
      expect(dds[1].textContent).toBe('2024/3/6');
      expect(dts[2].textContent).toBe('コントリビューターの人数');
      expect(dds[2].textContent).toBe('110人');
    });
  });

  test('存在しないパッケージの場合はエラーを出す', async () => {
    render(<App />);

    await userEvent.type(
      screen.getByRole('textbox', {
        name: 'パッケージ名',
      }),
      'invalidpackagename',
    );
    await userEvent.click(screen.getByRole('button', { name: 'チェック' }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toBe('パッケージが存在しません。');

      const dts = screen.getAllByRole('term');
      const dds = screen.getAllByRole('definition');

      expect(dts).toHaveLength(3);
      expect(dds).toHaveLength(3);

      expect(dts[0].textContent).toBe('週間ダウンロード数');
      expect(dds[0].textContent).toBe('');
      expect(dts[1].textContent).toBe('最新バージョンのリリース日');
      expect(dds[1].textContent).toBe('');
      expect(dts[2].textContent).toBe('コントリビューターの人数');
      expect(dds[2].textContent).toBe('');
    });
  });
});
