/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const SLACK_WEBHOOK_URL_BASE = env.SLACK_WEBHOOK_URL

		try {
			// 解析请求的内容
			const { method, headers } = request;
			if (method !== "POST") {
				return new Response("只支持 POST 请求", { status: 405 });
			}

			const contentType = headers.get("Content-Type");
			if (!contentType || !contentType.includes("application/json")) {
				return new Response("请求必须包含 JSON 数据", { status: 400 });
			}
			const token = headers.get("token");
			if (!token || !token.includes("cxoto")) {
				return new Response("token invalid", { status: 400 });
			}

			// 获取请求体
			const body = await request.json();

			console.log(body)

			// 判断请求内容
			let webhookUrl = SLACK_WEBHOOK_URL_BASE;
			let payload = null;

			if (body.type === "slackbot") {
				// 如果请求类型是发送给 Slackbot，直接构造简单的消息
				payload = {
					text: body.message || "默认消息内容",
				};
			} else if (body.type === "channel") {
				// 如果请求类型是指定频道，构造复杂的 payload
				payload = {
					channel: body.channel || "#general", // 默认发送到 #general
					username: body.username || "webhookbot",
					text: body.text || "默认消息内容",
					icon_emoji: body.icon_emoji || ":robot_face:",
				};
			} else {
				// 如果请求类型不符合，返回错误
				return new Response("未指定有效的消息类型（slackbot 或 channel）", { status: 400 });
			}

			// 发送消息到 Slack
			const response = await fetch(webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				return new Response("消息已成功发送到 Slack！", { status: 200 });
			} else {
				return new Response(`Slack API 调用失败: ${response.statusText}`, { status: response.status });
			}
		} catch (error) {
			return new Response(`发生错误: ${error.message}`, { status: 500 });
		}
	}
};
    