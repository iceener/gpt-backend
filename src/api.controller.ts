import { Body, Controller, Post } from '@nestjs/common';
import * as fs from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import { Action, APIResponse } from './types/api';

@Controller('/api')
export class ApiController {
  private readonly db;
  private readonly openai;

  constructor() {
    this.db = JSON.parse(fs.readFileSync('database/db.json', 'utf8'));

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  createCompletion(prompt) {
    return this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 1500,
      temperature: 0.3,
    });
  }

  @Post()
  async api(@Body() { action }: Action): Promise<APIResponse> {
    const prompt = `This is a todo list app. API Call (indexes are zero-indexed): ${action}
        Database State:
        ${JSON.stringify(this.db['todos'])}`;

    const [response, state] = await Promise.all([
      this.createCompletion(
        `${prompt}\\n\\nAPI Response (status,message,state) as valid json. State default format is JSON:`,
      ),
      this.createCompletion(
        `${prompt}\\n\\nThe value of 'New Database State' above (as json):`,
      ),
    ]);

    this.db['todos'] = JSON.parse(state.data.choices[0].text);
    fs.writeFileSync('database/db.json', JSON.stringify(this.db));

    return JSON.parse(response.data.choices[0].text);
  }
}
