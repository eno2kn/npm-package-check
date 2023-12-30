import { describe, expect, test } from 'vitest';
import { getGitHubRepoFromRepository } from './npm';

describe('package.json repository ', () => {
  test('parses GitHub repo from git URL with git protocol', () => {
    expect(
      getGitHubRepoFromRepository({
        url: 'git://github.com/isaacs/node-lru-cache.git',
      }),
    ).toStrictEqual({
      owner: 'isaacs',
      repo: 'node-lru-cache',
    });
  });

  test('parses GitHub repo from git URL with ssh protocol', () => {
    expect(
      getGitHubRepoFromRepository({
        url: 'git+ssh://git@github.com/brainjs/brain.js.git',
      }),
    ).toStrictEqual({
      owner: 'brainjs',
      repo: 'brain.js',
    });
  });

  test('parses GitHub repo from git URL with https protocol', () => {
    expect(
      getGitHubRepoFromRepository({
        url: 'git+https://github.com/statelyai/xstate.git',
      }),
    ).toStrictEqual({
      owner: 'statelyai',
      repo: 'xstate',
    });
  });

  test('parses GitHub repo from https URL', () => {
    expect(
      getGitHubRepoFromRepository({
        url: 'https://github.com/animate-css/animate.css.git',
      }),
    ).toStrictEqual({
      owner: 'animate-css',
      repo: 'animate.css',
    });
  });

  test('parses GitHub repo from ssh URL', () => {
    expect(
      getGitHubRepoFromRepository({
        url: 'ssh://git@github.com/potato4d/rehype-plugin-image-lazy-loading.git',
      }),
    ).toStrictEqual({
      owner: 'potato4d',
      repo: 'rehype-plugin-image-lazy-loading',
    });
  });

  test('parses GitHub repo from shorthand github URL', () => {
    expect(
      getGitHubRepoFromRepository({
        url: 'github:uber-web/uber-codemods',
      }),
    ).toEqual({
      owner: 'uber-web',
      repo: 'uber-codemods',
    });
  });

  test('returns null for GitLab repository URL', () => {
    expect(
      getGitHubRepoFromRepository({
        url: 'https://gitlab.com/flippidippi/download-git-repo.git',
      }),
    ).toBeNull();
  });

  test('returns null for invalid repository URL', () => {
    expect(
      getGitHubRepoFromRepository({
        url: 'https://github.com/animate-css/animate.css',
      }),
    ).toBeNull();
  });
});
