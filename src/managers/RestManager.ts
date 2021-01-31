import * as vscode from 'vscode';
const restOptions = ['🧠 Mind', '💪 Body', '🔮 Soul'];

export class RestManager {
  async showRestOptions(): Promise<void> {
    const option = await vscode.window.showInformationMessage(
      'Take a rest',
      ...restOptions
    );

    if (option === restOptions[0]) {
      await this.showMindOptions();
    }

    if (option === restOptions[1]) {
      await this.showBodyOptions();
    }

    if (option === restOptions[2]) {
      await this.showSoulOptions();
    }
  }

  async showMindOptions(): Promise<void> {
    const mindOptions = ['TWT', 'Reddit', 'Hacker News', 'Dev.to'];
    const option = await vscode.window.showInformationMessage(
      'Pick',
      ...mindOptions
    );

    if (option === mindOptions[0]) {
      await vscode.env.openExternal(
        vscode.Uri.parse(
          'https://www.youtube.com/channel/UC4JX40jDee_tINbkjycV4Sg'
        )
      );
      return;
    }

    if (option === mindOptions[1]) {
      await vscode.env.openExternal(
        vscode.Uri.parse('https://www.reddit.com/r/programming/')
      );
      return;
    }
    if (option === mindOptions[2]) {
      await vscode.env.openExternal(
        vscode.Uri.parse('https://news.ycombinator.com/')
      );
      return;
    }
    if (option === mindOptions[3]) {
      await vscode.env.openExternal(vscode.Uri.parse('https://dev.to/'));
      return;
    }
  }

  async showSoulOptions(): Promise<void> {
    const soulOptions = ['Meditation', 'Music'];
    const option = await vscode.window.showInformationMessage(
      'Pick',
      ...soulOptions
    );

    if (option === soulOptions[0]) {
      await vscode.env.openExternal(
        vscode.Uri.parse(
          'https://www.youtube.com/watch?v=HO-F8gTahaU&list=RDEM3wlB_t66z-5ySaQ9fsPlgg&start_radio=1'
        )
      );
      return;
    }
    if (option === soulOptions[1]) {
      await vscode.env.openExternal(
        vscode.Uri.parse(
          'https://open.spotify.com/artist/6ow78JLrWSmpuyIq1ynex4'
        )
      );
      return;
    }
  }

  async showBodyOptions(): Promise<void> {
    const bodyOptions = ['Stretch', 'Exercise', 'Yoga'];
    const option = await vscode.window.showInformationMessage(
      'Pick',
      ...bodyOptions
    );

    if (option === bodyOptions[0]) {
      await vscode.env.openExternal(
        vscode.Uri.parse('https://www.youtube.com/watch?v=wgPf9IJiW5s')
      );
      return;
    }
    if (option === bodyOptions[1]) {
      await vscode.env.openExternal(
        vscode.Uri.parse('https://www.youtube.com/watch?v=_nfITNlsm5s')
      );
      return;
    }

    if (option === bodyOptions[2]) {
      await vscode.env.openExternal(
        vscode.Uri.parse(
          'https://www.youtube.com/watch?v=TXU591OYOHA&list=PLui6Eyny-UzwxbWCWDbTzEwsZnnROBTIL'
        )
      );
      return;
    }
  }
}
