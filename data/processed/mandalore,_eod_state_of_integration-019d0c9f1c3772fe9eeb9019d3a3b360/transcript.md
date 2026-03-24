# Mandalore, EOD State of Integration - Mar, 20

# Transcript
**Wesley Donaldson | 00:28**
Why do I keep having to click on this same meeting? Discuss that in architecture, maybe, and a membership.

**Jivko Ivanov | 00:47**
It's just you and me. The lone warriors.

**Wesley Donaldson | 00:50**
[Laughter] I'll give them a couple of minutes. I know. I definitely spoke to Francis and asked him if he could attend here, and he said yes.
So afternoon, gentlemen. TGIF, right? Almost there. All right, I know when you can see my screen. Ignore that is not something we need to worry about today.
The man of the hour, Francis, has arrived. Anyone play start? Anyone ever heard of that game?

**francis.pena@llsa.com | 01:50**
Now. Don't remember it?

**Wesley Donaldson | 01:52**
You don't remember?

**francis.pena@llsa.com | 01:53**
If I have...

**Wesley Donaldson | 01:54**
No one has played Starcraft too, guys. We are engineers. I guarantee one of you who played Starcraft too.

**francis.pena@llsa.com | 02:05**
Call me out.

**Wesley Donaldson | 02:07**
[Laughter] Now you... When it's like one of the biggest RPGs... I'll just show you guys I'm super shocked. Star okay, there you go, that's... Yeah, I my god, I'm old.

**Jivko Ivanov | 02:18**
I stopped late when the AI came out, so probably that's after my time.

**Wesley Donaldson | 02:27**
I played Stargref when I was in like, college, so like around 2002 ish, 2001 ish they used to play.

**jeremy.campeau@llsa.com | 02:35**
Most of the Starcraft and Starcraft came out.

**Wesley Donaldson | 02:37**
Yeah. Exactly. So, Brood Wars was the original... What we got... Six more people should be everyone. Brood was the original. But Starcraft, who has been around for something crazy, like 15 years, 20 years, something like that, and it's like one of the longest-running games ever.
Maybe one day we'll play together. All right, let's jump in. Okay, so as I said, this is not status, so I'm not going to ask for status. One thing that we had kept, we had captured some pretty important parts from our conversation yesterday.
I've ticketed up most of those, and those tend to translate into tickets that I think have some relation to you, Francis. Why? I signed a few to you, but full transparency, they may not be your tickets.
So I wanted to invite you to the conversation and just... You should be a part of this. Generally, when you invite the conversation and ask... Just talk through if this is the right fit for you and what maybe we split them out a little bit. There were two within 1.1. I just talked about the production environment specifically around... We had a great conversation with Jiffco about this.
If we're doing blue deployment, which we should be, what is the production domain name that we want to use for the API gateway? I think that's a bigger conversation of like, "What is the production instance?"
Generally, we should... That you already have a separate ticket for that. That's the booking, the Lifeline screening.

**francis.pena@llsa.com | 04:05**
Yeah, it's actually a booking.

**Wesley Donaldson | 04:06**
So I think that should be sorry, that's me I keep fricking saying booking it's book it's like a but whatever it's book.

**francis.pena@llsa.com | 04:07**
If they change that, I haven't been told, okay, because it makes more sense, I agree. [Laughter] Okay, so maybe a BI.

**Wesley Donaldson | 04:17**
So I think this is open.

**francis.pena@llsa.com | 04:20**
Book or super graph, whatever.

**Wesley Donaldson | 04:24**
I would say follow the best pattern and keep it relevant. Like you, all of us, and Jiffco had a really good point. This doesn't need to be pretty. This could just be... Do something or the other. I wouldn't go that far, but we do need some kind of representation of the API gateway that we can push into recurrently the target there for them to target our Webs or our instance.
Okay, so that is one of these.

**francis.pena@llsa.com | 04:52**
Yeah, that's another one.

**Wesley Donaldson | 04:52**
This guy. Okay, the other one is more general. Sorry. The other one is a little bit more in the weeds. Have you had a chance to look through this one?

**francis.pena@llsa.com | 05:10**
Yeah, I was just reviewing it. What he says here is that we need to deploy or have definitions for the production environment but it should be whatever we did for death, right? It should be the same code, same infrastructure, same everything.
So I guess that the only thing blocking this is having the domains for the... It's true for both because we use domains in the dev environment. So it's just... I guess the only action I hear for me would be having the domains but the code for whatever we deployed in death should be the same for production if it's only blocking it because we don't have the DNS domains that should be a problem for death. So we can add that for death and for production.
But the
infrastructure itself should be built the same way.

**Wesley Donaldson | 05:59**
Okay, so we have... That's on you, right? The infrastructure... You already have the CDK for and that should be for production, correct? So the only thing that's missing here is just once we get the domains, connecting them to the environment that you've already set up in the CDK.

**Jivko Ivanov | 06:18**
So yeah, we have the CDK but... It's not for production this time, it's only reaching to death. Yes, it has blue, green, everything. So it should be easy to adapt. Sorry. Part there.

**Wesley Donaldson | 06:29**
Okay, so all right, so then let's clarify them. So we only have dev now. We need to update the CDK to include a production environment.

**Jivko Ivanov | 06:36**
That's good.

**Wesley Donaldson | 06:37**
Okay, so hold on, let's just let's not lose that.
Okay, so anything else here team that we're missing. So we have we just we the concern around security like Francis, if you want to speak to this I think this was just more of a general question. What do we have? Is it just basic configuration?
And all of our API gateways? Like what do we have for like denial of service attacks? Like known en known ingress like are we setting a particular only this domain or this subset of IP addresses can get to our. What security levels or security posture do we need to have for recurrly? Coming in.
Like. Any thoughts on this?

**francis.pena@llsa.com | 07:31**
Yeah, the data makes sense. It's just... I mean, reviewing that, looking at what we need. This is the first time we have an API that it's not meant to be for the public, so... Well, actually the IP that main gateway one that we created recently for the main portal...
But anyways, they think it makes sense just to have a plan to document what we can do, what we need to do, and all that. So it makes sense to me. Just to see what we want to do and what we can do to protect it.
Then other tickets to implement that. But the first ticket is just to see what the options are and what we want.

**Wesley Donaldson | 08:06**
Yeah, I don't think I have just the investigation ticket right now.

**francis.pena@llsa.com | 08:11**
Yeah, exactly.

**Wesley Donaldson | 08:11**
This like identify the gaps. So just like once you have a. So it's assigned to you already it's been ready for dev. If I can ask you to take a look at that today.
And just like if you can generate a P of V by Monday because just to give us enough time to actually action it.

**jeremy.campeau@llsa.com | 08:25**
I'll drop a link in the chat if we are going to filter by IP address or... Curly does have an API list on their documentation.

**Wesley Donaldson | 08:34**
Perfect.

**francis.pena@llsa.com | 08:36**
Okay. Thank you, that'll be great.

**Wesley Donaldson | 08:37**
I think that's the absolute minimum we should do, actually.

**francis.pena@llsa.com | 08:40**
Yeah, exactly.

**Wesley Donaldson | 08:42**
I mean, that's actually all we need to do, because if it's an allow list, then no one that we'd have to worry about, Das or anything else.

**francis.pena@llsa.com | 08:49**
The right limiting if you maybe... If you are worried that they might just have an issue where they send a lot or something like that.

**Wesley Donaldson | 08:56**
I think my worry there is... Now you're right.

**francis.pena@llsa.com | 08:57**
Ca I see you right.

**Wesley Donaldson | 09:01**
Like the rate limit that I'm thinking about is it's stupid like we would just set it at a high number because it like we should be able to have that.

**francis.pena@llsa.com | 09:05**
Okay, we want them to send this as much as possible.

**Wesley Donaldson | 09:09**
Exactly.

**francis.pena@llsa.com | 09:10**
Yeah.

**Wesley Donaldson | 09:11**
Yeah, we could.

**francis.pena@llsa.com | 09:12**
Okay. Okay, so.

**Wesley Donaldson | 09:15**
You said it in the chat. Where are you? Yeah, here we go. Copy. Let me just throw that on the ticket real quick for you.

**francis.pena@llsa.com | 09:24**
Thank you. So for now we can say the desired at least like the minimum should be the w okay, the IP allow is with the waf.

**Wesley Donaldson | 09:31**
Yep, okay, good.

**francis.pena@llsa.com | 09:33**
Okay, that should be simple.

**Wesley Donaldson | 09:37**
All right, what else do we got? So we got this area... Has everyone... Does everyone feel like we've covered off on these? I think yes, but anyone disagree that we've covered off on these two concerns?

**francis.pena@llsa.com | 09:48**
My only concern is that this doesn't say concern.

**Wesley Donaldson | 09:51**
All right, I'm going to move these off the board then.
So... So... You guys are gone. You guys are gone. I'll leave them up there just so we know that they didn't get removed. All right, the other my gosh, Jesus.

**francis.pena@llsa.com | 10:02**
I still have an issue with it because it doesn't say a concern. My wie just. Just kidding, [Laughter].

**Wesley Donaldson | 10:09**
Fair enough, co NCERN fair enough. There we go. And okay, I can't believe he's spell checking me on this, but it's fair. We never sal for this, but I think the answer ji go is just use the original channel. I owe. I a response on this. I need to get back with Jennifer and just confirm if she wants to do.
If we want to do something specific for reculy, but for now, if you can. I assume it's already going to the base. The regular, notification channel inside of teams.

**Jivko Ivanov | 10:39**
Yeah, I think it's the center.

**Wesley Donaldson | 10:41**
Okay, so I'll leave that alone. I'll leave that on the board rather...
Okay. The two other things that we identified were we were not sure of what the notification scheme is like. Is there an equivalent to some kind of dead letter queue with alerts with a dashboard for events coming into event grid?
So that would be...

**Jivko Ivanov | 11:02**
Of that...

**francis.pena@llsa.com | 11:04**
Yeah, I'll do, I will. I saw the ticket yeah, I'll do the work. What we document we have the core implementation which show 5, we have the letter ques we have all of that re I policies. And so I'll document how it works. I just did the same for this one, so actually you can put a green there because that's stone.

**Wesley Donaldson | 11:24**
That is this guy done?

**francis.pena@llsa.com | 11:26**
Yeah, that guy.

**Wesley Donaldson | 11:27**
Sam slapped my hand a little bit this afternoon. Like, let's use black for if it's, like it's done as far as like a functional area, let's. And then we'll reserve green for it.

**francis.pena@llsa.com | 11:35**
Four.

**Wesley Donaldson | 11:36**
No, it's in production currently and working, so that's a good distinction.
So that's actually very...

**francis.pena@llsa.com | 11:41**
All right, that's fine. It's actually in production. It's just that it's not integrated with the things on the site, like the LLaMA in the BS and the e-com API but as far as that goes, it's there.

**Wesley Donaldson | 11:50**
Okay, then it's in production. Like...

**francis.pena@llsa.com | 11:53**
We have all the environments deploy the resources.

**Wesley Donaldson | 11:55**
Okay, so that's in production. Generally the equivalent of a LLaMA or whatever this event is like to do is these already in production, we're just updating them or these are...

**francis.pena@llsa.com | 11:58**
Y.

**Wesley Donaldson | 12:07**
NET new like three.

**francis.pena@llsa.com | 12:09**
This I think it's a mistake here because this the way that we have it with a five does not land that there. It's just the ecom you can move that block all the way to the home brame and it's an IIS service run on window server on prem.

**Wesley Donaldson | 12:22**
It's not as okay, but it lives in Azure though, right on Prime.

**francis.pena@llsa.com | 12:26**
No, it's ant on prem, so it'll be to the right.
Yeah, so yeah, st there, yeah, exactly. So that's what that's how it is for TP five and I see the name we have here. CHP the top five one is EC two, so if it's gonna be ECOM three, sorry, ECON 3, it's gonna be there as well.
So, yeah, that's it.

**Wesley Donaldson | 12:45**
Okay, so then I can consider this done. This is in production then, right? Because there's nothing else left here like this is okay, so this is done then.

**francis.pena@llsa.com | 12:50**
No, exactly.

**Wesley Donaldson | 12:57**
All right. In.

**francis.pena@llsa.com | 12:58**
So yeah, I'll... That'll take it about documenting the retry, metrics, the electric queues, all of that. I'll complete that ticket as well. Maybe... Since you said the other one is for today...
Monday morning.

**Wesley Donaldson | 13:09**
No, the one that I'm really worried about is just like the one that may require us to have an additional conversation. So that's just the infrastructure and the security one. What was that exact number? Was it this guy? No, the API gateway 9.

**francis.pena@llsa.com | 13:35**
Yeah, this is the one where we do the... At least... The other one I think I had another one.

**Wesley Donaldson | 13:41**
Yeah, Doc production. This is... Jico's going to take a look at this, but you still need to do the... The domain name for...

**francis.pena@llsa.com | 13:53**
The... Yeah, I'll do that.

**Wesley Donaldson | 13:55**
Okay, and JFFCO... I need to get you a ticket for... I already have a skeleton for the prod environment, so I'll get you that documented. Jico, you're pretty heads-down on the coupon stuff. Antonio on the call, yes, you are.
Tony, you're pretty busy. Jeff, since you did the original CDK, do you think you can tackle this? It should just be minor configuration changes, I'm assuming.

**Jivko Ivanov | 14:24**
Again, I'm not sure I have access to everything in production, but yeah, I'm sure I can do it.

**Wesley Donaldson | 14:28**
Okay.

**Jivko Ivanov | 14:32**
For production, yes, just need to access... We'll double-check on that. Let's assume for now that I hear...

**francis.pena@llsa.com | 14:37**
So yeah, and if not, you can... Maybe even by... Just the key hub actions for the environments and the secrets in Azure if you need that. But, yeah, you can reach out to me if... If you have... Yeah. Sounds good.

**Wesley Donaldson | 14:48**
Right, the only other one I don't think Jennifer's on here. She's not... I'll connect with Jennifer. I'm trying to get a meeting with her this afternoon. The only other one was actually just putting it all together.
So if we have the secrets inside of... Like we need to actually make sure that Recurly is configured to hit our API gateway. Make sure Recurly is standing over the... Like the key, the secret needed for the...
So, the goal here is just to get this all buttoned up. That's what that ticket is. Beth was very clear. That's not on her. So that's on Jennifer. But I'll stick with her to make sure that if there's anything I need to take or we need to take from her.
So that's everything on that side. Then for 1.2 again, I think we're good here. We only had just the strategy around the LQ, which is just if you just get a comment on here or just flag it as done.
Yeah, I already have it sent to you. Then the ECOM pipeline infrastructure, you guys already have that. I think that's it. All right. Same question is as always. Anything that we feel we're missing to go...
So to go really quickly through it. User comes in on our... We have our own book dot lifeline screening takes in 10% of the users coming from social. They complete the order. We already have the UI the order flow. Everything is working there that gets pushed into Recurly. Recurly has obviously stores the order and information they send us web hooks that right now is in process. We have code and this should be black because we've tested this, right? Antonio, we actually... We know we have not... Because you said you were waiting for the connection from... Updating the domain name for the API gateway, correct?

**Antônio Falcão Jr | 16:35**
Yeah, but IW what I could see from last is, demonstration. We do have that working already even with a temporary DNS. You guys can confirm that, please. I'm assuming that in place somehow...

**Wesley Donaldson | 16:49**
Yeah, I think... Lance, you said you tested in your PR environment, just straight up giving you that comically long URL.
So we've confirmed it. Let me just leave it this way until your test is running. To... I think that's better because that's like end-to-end or end-to-here anyway. Beginning to hear... Okay, this we're already good on. We're good on these. There's still a question of how to actually test how to test right here. Actually getting orders failed.
I think we had agreed that we're just going to mess with the signature or just maybe change the URL or something. So that still needs to be done. Let's keep going. Notification we already spoke about that. Hydration is already good, no changes on that today. There may be a change based on some conversation with states, but for now, stay the course. We'll know on Monday. What else do we got? Blas already heads down on these two tickets. We already have tickets for those they're already working we're good here. Jeremy is superheroing this. He's got a PR he thinks soon got just bus he's working through this. This is already known quantity.
Okay. I think we're good. Does anyone have any change to the status of any of these work streams?

**Antônio Falcão Jr | 18:08**
Not...

**francis.pena@llsa.com | 18:08**
Specifically...

**Wesley Donaldson | 18:09**
Okay, sweet. All right, then, we're done. Unless there are any questions or anyone has any concerns, really have a really good story. We want to talk a little bit, Starcraft, anything like that, otherwise we can call it a day.
All right? Hearing none. Gentlemen, enjoy the rest of the day, enjoy your weekend. Again, I'm feeling very good about this. I hope you are too.
If you're not... You don't feel comfortable sitting it right here, please message me on the side. Let me hear your concerns. But I think we're tracking really well for the projected launch date of this with the good progress that Jeremy has here with all of the stuff already done with the ingestion pretty much done.
So again, if you disagree with that, that's... There's nothing wrong with disagreeing. But please, drop me a DM, let's talk about it. Otherwise, enjoy your weekend.

**jeremy.campeau@llsa.com | 19:02**
Thank. Thank you. Thanks. Have a good one.

**Antônio Falcão Jr | 19:04**
Guys. Talk to you.

