import { Toucan } from 'toucan-js';
export interface Env {
	SHITTY_API_URL: string;
	SHITTY_API_USERNAME: string;
	SHITTY_API_PASSWORD: string;
	BOTNORREA_WEBHOOK: string;
	BOTNORREA_AUTH: string;
	SENTRY_DSN: string;
	STAGE: string;
}

interface BirthdayResult {
	users: Array<string>;
}

export default {
	async scheduled(_event: ScheduledEvent, env: Env, context: ExecutionContext): Promise<void> {
		const sentry = new Toucan({ dsn: env.SENTRY_DSN, context, environment: env.STAGE, enabled: env.STAGE === 'production' });
		try {
			console.log('Looking for birthdays');
			const birthdayResponse = await fetch(env.SHITTY_API_URL + '/users/birthdays', {
				headers: { Authorization: 'Basic ' + btoa(env.SHITTY_API_USERNAME + ':' + env.SHITTY_API_PASSWORD) },
			});

			if (!birthdayResponse.ok) {
				console.log('Failed to get the birtday users');
				return;
			}

			const birthday = (await birthdayResponse.json()) as BirthdayResult;
			if (!birthday.users?.length) {
				console.log('No birthdays today :(');
				return;
			}

			console.log('Happy birthday', birthday.users);
			const birtdayMessage = 'Feliz pumpesito 🥳🎉 ' + birthday.users.map((user) => '@' + user).join(' ');

			await fetch(env.BOTNORREA_WEBHOOK, {
				method: 'POST',
				headers: { Authorization: env.BOTNORREA_AUTH },
				body: JSON.stringify({ message: birtdayMessage }),
			});
		} catch (error) {
			sentry.captureException(error);
		}
	},

	async fetch(_event: FetchEvent) {
		return new Response(JSON.stringify({ message: 'Happy birthday' }), {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		});
	},
};