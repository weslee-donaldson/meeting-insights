# Pre-Mortem for Commerce - Mar, 13

# Transcript
**Wesley Donaldson | 01:29**
Afternoon.

**Sam Hatoum | 01:44**
For a few minutes to come in. I'll get ready at my desk.

**Wesley Donaldson | 02:13**
You said... I'm just... Be aware, you and Beth are double booked, and I think they're in the same meeting at this time, but stays had availability in this time.

**Sam Hatoum | 02:21**
Yes, this is not making it. Is that what she said?

**Wesley Donaldson | 02:27**
No. He's available. He's aware of the meeting.
So... I expect he'll be in attendance.

**Sam Hatoum | 02:31**
Okay, got

**Speaker 3 | 02:33**
It. Got it.

**Sam Hatoum | 02:34**
Okay, cool, let's... Here, let's just wait one more minute, and you can get started.

**harry.dennen@llsa.com | 03:25**
So is a pre-mortem like a checkup before you die?

**Jennifer | 03:35**
It's like the ritual of the last rites or something.

**Speaker 6 | 03:39**
I think we're preparing to die here. You know.

**Sam Hatoum | 03:42**
We're... [Laughter] I am your purveyor of death. [Laughter].

**Speaker 6 | 03:49**
We should all do it, though, because that's inevitable.

**Wesley Donaldson | 03:54**
That's crazy.

**Sam Hatoum | 03:55**
Actually... Funny, like getting a bit better here, one of the meditation practices that people do.
If you're into meditation, it's actually like meditating when you're on that.
Yeah, memento more, of course.
Yeah, somebody meditates.

**harry.dennen@llsa.com | 04:12**
Have it on my pen.

**Sam Hatoum | 04:18**
Cool, then I want on that Reddit like "What could go wrong?" I read it.

**harry.dennen@llsa.com | 04:25**
No, I haven't seen that.

**Sam Hatoum | 04:26**
SA man, it's freaking hilarious. I it just it makes my day every day. But, yeah, this is one of those sessions today. This is. What could possibly go wrong? Like, let's just get started. So, whereas if you can turn on our AI overlords to record the session, we can start to pull important information out of it.
But it's a free-for-all, just like spending the first five minutes writing down individual thinking as part of this exercise. What are all the things that can go wrong when we launch with...
Why are we on the front page of the news? Is a good framing. Another one is, "Why did the board decide to fire everybody?" Because we're just doing a terrible job. Why did you get woken up at 05:00 and 3 in the morning? Not too bad.
But why did you get woken up at 2:30 in the morning? In the mid-depth of his sleep? These are the sorts of things that we should be asking ourselves right now. If you can just take five minutes with that preparation, just think of all the things that you, from your individual perspective, think could possibly go wrong.
So the exercise here is individual thinking, then we do group thinking, and this is where we get everything surfaced. Does that make sense to everybody? The point of this exercise is we're trying to mitigate all the risks.
See? Identify all the risks before we even hit them. All right, cool. So with that, you like to start at 5 at least.

**Speaker 6 | 06:04**
Please, question when you say what could go wrong, what severity we should be targeting, only critical paths or even something not that critical.

**Sam Hatoum | 06:18**
I mean, if you want to nuance it like go ahead. I think it's stuff that's like, you know, gonna make us fail. I think, like, is the way to look at it, if it's a minor thing. And we think like, yeah, it's just gonna be like that. That, you know, life goes on. We keep calm and carry on. We know how to fix it.
It's easy. It's not going to stop the payments coming in. It's not going to put us on the news. It's not going to make us bleed. These sources are not going to make the costs go crazy high. All these sorts of things I think are okay, but if it's any of the things I did mention, then you like, "Let's do it." Severity high, I guess would be the idea. Good question.
Okay, thank you. Any other questions before we get into it? All right, no right answer, sorry, no wrong answer, all answers are right, so please just let's take five minutes. It's now 37 past the hour. Let's take seven minutes.
That's 7 minutes. Nice and square. So we'll come back at 45 past the hour. Just list them away on a notepad. Whatever it is, turn the volume off. Over a walk to what you got to do. Let's come back and start shouting them out. Go.
Stay. So I think you just joined. I just asked the team to take another three minutes remaining to come up with all things that could possibly go wrong for a release.
That's why Ione is so quiet. Individual the drive thinking first. We do group think. Yeah.

**Stace | 12:29**
I was just reading the Copilot catch me up summary.

**Sam Hatoum | 15:02**
Right, we are at time. So now what we're gonna do is just do a bit of a round robin and then, start to state all the different things that we've come up with. So I'll pick the first person. Then once you've said that one thing, cross it off your list and pass the buck to the next person. You choose the next person, and we'll keep going that way until we've exhausted all the collection.
All right? Then we can discuss them on the fly as well. We can take a few minutes. If it's no discussion, great. If it's lots of discussion, then we can timebox that and then move on to the next one.
So let's start there. I'll pick... Xolv, you started talking earlier, so you go first.

**Speaker 6 | 15:46**
I did set up myself up. So thank you. So here is what I'm forgetting down here. For me, the biggest thing is the user not being able to make the purchase. That means the funnel the floor doesn't complete somewhere is blocked.
That could be due to API outage, that could be due to recovery outage. That could be due to us introducing some issues with the codes. Not enough testing, that kind of stuff. But for me, that is critical.
Because our product is basically not working. The users are unhappy. We are getting lots of calls, and that's a lot of heat. That's the big thing. Yes, please.

**Sam Hatoum | 16:46**
No, awesome, thank you. That's I think that's something we can discuss outages and the pipe being broken across the hallway. Definitely a good one. Thank you. Moving on to the next one.
If I could just say please.

**Speaker 6 | 16:58**
Have mitigation for me. We need to have a scheduled automated test that goes through our flow on regular intervals and notifies us if something is wrong immediately, not wait for the clients to tell us that.

**Sam Hatoum | 17:15**
It's a great point. Yeah. We can get into a discussion of solutions and things. I think like let's what's going to happen likely now is as you say you're saying somebody else has already listed it, so you can just cross it off your list if you've already listed something like this.

**Wesley Donaldson | 17:22**
Of. Out.

**Sam Hatoum | 17:28**
Let's get all the ideas flowing, get everyone's brains doped up, and then we can get deeper into it. Whereas, if you please could just make sure we're tracking all of these so we can go back over this list once the team is done.
So, Jeff, go pick the next person, please.

**Speaker 6 | 17:42**
Next to me on the line is Harry on the screen, please.

**harry.dennen@llsa.com | 17:48**
Hey, I thought that might happen. Okay, so I've got two around purchase. That's the big one here. So purchase participant purchases, but they don't receive the correct screening. So I can imagine missing purchase events and we don't know that we're missing them or potentially malformed purchase events that we do not know are malformed.
So some sort of misconfiguration between what we have in recurring and what we're recording and...

**lance.fallon@llsa.com | 18:17**
What we're offering.

**harry.dennen@llsa.com | 18:19**
The other one is again around the purchase funnel, which should be participant cannot purchase and then in parentheses, they can't purchase what they want to purchase. So we might see conversion rates lower than expected and we don't know that they're lower than they should be. That can indicate something going on the actual sale page somewhere in the funnel.
Then purchase types following a pattern that exclude the purchases we would expect. So we have a bunch of different offerings, but if we can see everyone's purchasing just one of them, that can be indicative of an issue.
So we need a way to know that that's happening soon to protect the funnel and make sure the conversion rates as high as it can be. Those are mine.

**Sam Hatoum | 19:08**
So you did too, which is... Okay, we'll let you off the hook, but thank you very much. Yeah, everybody else just... Alright, just do one please, just so we can keep the conversation flowing. So yeah, next person please, who is on your list?

**harry.dennen@llsa.com | 19:20**
Harry I'll go. Da.

**Speaker 3 | 19:23**
Alright, start the top for something that I haven't crossed off the site's not access on VPN just causes confusion. Probably not the worst thing that could happen, but it has happened before.

**Sam Hatoum | 19:40**
What does that mean on our VPN?

**Speaker 3 | 19:42**
So we usually have some infrastructural pieces for allowing access to the site either SAR configuration or some other thing right as you're navigating to it. I mean, it should be publicly accessible, but we've had problems in the past where certain searches are blocked on our VPN, and that causes confusion when trying to track issues.

**Sam Hatoum | 20:07**
Got it. So, networking setup and connectivity where it looks good to us but it doesn't work externally. Is that what you mean?

**Speaker 3 | 20:15**
Yeah, completely mitigateable, right? These are things that you can hopefully plan for in test as you go live.

**Sam Hatoum | 20:23**
Yeah, it's a good one. Who's next on your list?

**Speaker 3 | 20:30**
The pass to me. Hall.

**Michal Kawka | 20:36**
Yes. My main concerns are around the infrastructure, so I wasn't heavily involved in the development, so I contributed just a bit with the playwright tests and some endpoints in the graph. I'm not fully aware of the complete functionality, but in the last month or one and a half months, we encountered quite a few issues with the blue-green that were basically silent failures.
So I think over the last two weeks, we learned our lesson, and we improved the blue-green, we improved the detection, and we made the workflows more bulletproof. But I'm mostly concerned that we might again run into a situation where we think that we are blue-green, but we are not. We are deploying to only one instance.
So for example, only to blue, which actually happened last week or two weeks ago. I think we're in a good shape to check it even manually right now because we know where to look. So the load balancer, the target groups, and the versions of the lambdas, we know what to do, but these are my main concerns.
So basically, the infrastructure and the silent failures that we might miss.

**Sam Hatoum | 21:56**
Great, thank you. Definitely a good one. Silent failures, a silent killer, literally. Okay, cool, good one. We can talk about solutions soon, but that's another hot one. Thank you so much. Mihao, who's your next victim?

**Michal Kawka | 22:10**
I'll pass the ball to Lance.

**lance.fallon@llsa.com | 22:17**
First one on the list is consistent. I think we're able to consistently and accurately map our recurring invoices to the shop ID. They're hoping that we don't map them wrong. This... Products, packages, memberships. They're hoping that we don't map the parent-child relationship wrong accidentally with the wrong participant, basically, accurately create Anthropic start as okay.

**Sam Hatoum | 22:53**
So you're around like the migration in the smooth transition from Shopify to a curly, and specifically around the data types and mismatches and things like that and what we can do to mitigate that. Is that right? Thank you
so much. Choose your victim.

**lance.fallon@llsa.com | 23:15**
Pass it through. Gerubim.

**jeremy.campeau@llsa.com | 23:19**
Thanks. So for me, I just have incorrect item setup. So basically, if we have a clash of how gold, silver, and PLA is set up with the individual products, maybe it won't show the user on screen what they can purchase, or maybe they're actually double-purchasing, like it tests accidentally.
So that's one of my main concerns, and I will pass it off to Jennifer.

**Jennifer | 23:59**
Okay, the things that I was writing down are like issues with payments, like we're charging the people the wrong amount, double charges, or we end up not charging people.

**Sam Hatoum | 24:18**
Jaykes, yeah, business won't be happy about that. That's definitely a fire the team offense. Cool. On the line...

**Jennifer | 24:31**
You gone? West? Have you gone?

**Wesley Donaldson | 24:34**
I have not. You just actually hit my number one. But next one down is data breaching. We're showing health or CC data, emails, or on the web. Just basically sharing data in a sensitive data in the wrong locations.

**Sam Hatoum | 24:53**
Front page material right there. Alright, so if we've done a full round, yeah, just let's do another round where. So if you want to just, I guess go back to we'll do the same circle. So let's see if I can do it from memory. Jifco. You up?
So what's your next item?

**Speaker 6 | 25:17**
Let's see. I think it was about payments and stuff. Let's see. Yes. So another thing I put here is about malicious activity that doesn't take our site completely down, like tries to flood it to something else.
But people have troubles using it, and when we try it from our site, we may not be able to see it. But that should result in degrees of conversion or something like that.

**Sam Hatoum | 26:05**
So to decrease conversion definitely. Yeah, that makes sense just to replay it back. Malicious attacks lead to decreased conversions or just in general decrease conversions because of some other thing.

**Speaker 6 | 26:16**
I would actually go a step further when I say malicious facts. Not just decreased conversions, but maybe stealing of the data, that kind of stuff as well, like malicious activity is what I'm trying. Okay.

**Sam Hatoum | 26:27**
Just select SEC secure. Yeah, okay, got it. Cool, yeah, that definitely a good one. Then after you... Harry went... But Harry finished his two because he jumped his turn and took two, and then Harry, you passed it over to... Let me see. Who did you pass it over to? Was it Jeremy? Da.
Okay.

**Speaker 3 | 26:49**
Next one I got would be problems with the legacy order proxy. So not so much. I think what Lance mentioned was problems of configuration or looking up the correct packaging products.

**Michal Kawka | 27:05**
But if we...

**Speaker 3 | 27:09**
End up having a lot of participant duplication, right? That could be some messy cleanup as that stuff pulls back in to thrive. You'd ultimately then have participants who may be on maybe the same actually identified participant, but then have separate streams.

**Sam Hatoum | 27:32**
Interesting. Okay, so you're saying something goes wrong with the migration and we end up with some kind of duplication or emissions. Is that the idea? Yeah, problems with problems.

**Speaker 3 | 27:45**
With properly identifying existing participants on our end in the proxy, right? They'll come back in as a legacy or legacy domain events. Right? Incorrectly, you'll have completely new participants duplicated in our new Thrive system.

**Sam Hatoum | 28:06**
Whereas just as we go through the final rounds, if you don't mind getting these ready into a table and then we're going to start populating that table together as a group. So if you can put it, maybe a Miro table where everyone can come join. That would be super handy.
If not, a table just sticks anything like that so we can all come and... Thank you so much. All right, so you chose Jeremy, right?

**Speaker 3 | 28:27**
Yep, actually Noremy Hall.

**Sam Hatoum | 28:30**
Me... How? Man, I'm going to stop playing this because I'm just terrible at it. I'll just... Lose the next person's call.

**Michal Kawka | 28:37**
I have nothing to add. My main concern is the infrastructure, so I will repeat myself.

**Sam Hatoum | 28:47**
Alright, no problem. Cool, so I'll just keep it as a free-for-all. Now whoever's got some remaining items, please just go ahead and shout them out.

**Jennifer | 28:58**
In addition to duplicate participants merged incorrectly, so we have a participant merge with someone that's not them.

**lance.fallon@llsa.com | 29:15**
I had one for potential difficulty in managing accounts recurringly, I guess as it relates to perhaps a successful purchase within a failed C-star order submission. Then we wind up with a lot of littered accounts that are open and difficult to identify inside AC8.

**Sam Hatoum | 29:43**
Anyone else got some more?

**Jennifer | 29:45**
The checkout button spins and never shows success, causing call center issues or even people getting through the flow or validation is preventing checkout for some reason, with no guidance to fix it.

**harry.dennen@llsa.com | 30:06**
Our order form is there's something wrong there because we should see different purchases happening like.

**Jennifer | 30:11**
So somebody not being able to purchase certain things.

**harry.dennen@llsa.com | 30:14**
Yeah, so things that you think might be purchasable are not or they're hidden because of some silly bug or they're trying to purchase them, but it's not actually making it to the purchase because there's a misaligned feeling. MCURLY versus what we have things like that.

**Stace | 30:32**
So to be there's to make this actionable, there are probably two parts, right? One is the pattern, so I think it could flow into your next one. Conversion rate lower than expected on something right? Could be overall conversion rate could be... Why did we have no upsells today?
Yeah, the one that's most actionable by us and our team is our code resilient enough? Where if when we fetch the list of products from Recurly, if one of them doesn't make sense, can we handle that failure gracefully alert on it and still let the user do something?
Yeah, right, I think that's a very valid concern is, yeah, highly likely that at some point someone's going to fat finger something and to Recurly. It shouldn't blow everything up.

**Jennifer | 31:28**
Yeah, I think that's this one too. Yeah, incorrect setup for product information.

**Stace | 31:35**
I think the industry... Great if you do. There's probably two parts, right? One to make sure we've got the right resilience and catches and tests in our code so we can handle it best.

**Jennifer | 31:45**
So if we talk about the incorrect setup, if Recurly is set up incorrectly, it's probably a high likelihood. If we have it set up correctly, it could be low impact.

**Stace | 31:59**
Yeah, I think it's a shared responsibility, right? Our code has to handle things, right? Then I can work on a product. We can work with the business to make sure that we give them a process that they're responsible for following, right? We don't want to be in the business of having to look over the shoulder and QA marketing every time they enter a coupon code, right?
We want to give them some steps to do so that they can validate their own work.

**Jennifer | 32:28**
Okay. So if we don't have that stuff in place. So, purchase pattern or products set up not aligning to code like that. Like it doesn't we don't handle it gracefully.

**lance.fallon@llsa.com | 32:50**
I assume we're referring to things that have to be hard-coded. So I know for memberships, the add-ons are a built-in feature, but with things like packages right now, it could very easily fat-finger a custom field that references a non-existing product, for instance.

**Jennifer | 33:21**
That makes sense. And hopefully we get some of like most of those handled gracefully. Yeah.

**Sam Hatoum | 33:31**
It's just in the interest of time. I just want to... I think what would be good is if we can just scan across them real quick and just see... Let's start just by labeling the more... Whether they're high
or low. So maybe just put them outside the likelihood, but just on the impact, just on the vertical impact. Yeah. So just outside the box. But high or low to see whether it's high impact or low. Can we just go through all of them real quick in 5 seconds high, low, and keep going because we're likely... Then we can do the likelihood or actually, sorry, I'm thinking out loud. I'm trying to get through this as quickly as possible. Can we give it a ten

**Jennifer | 34:08**
Seconds? Low point? Yeah, so this one, are we talking about impact?

**Sam Hatoum | 34:14**
Yeah, like conversation rates lower than expected conversion rates lower... Yeah, it's high impact, stays yes. Okay, cool, then it's in high impact now. Likelihood, what do we think? How likely is it that we'll get back conversion rates because of... Just because of anything using us as a lower height?

**Stace | 34:41**
I got to say something about conversion rates. I'm going to push back and say it's probably a medium impact. It's one of those slow rules and it's pretty broad, right? It could be things, I guess. That one, I think we should let's move on because we have to pick that apart, right? Is it not converting because we broke the code, or is it not converting because the button's blue and it should be green?

**Sam Hatoum | 35:06**
Yeah.

**Jennifer | 35:07**
We already did this one, right?

**Sam Hatoum | 35:09**
All right.

**Jennifer | 35:09**
Excell silent failures, switching not happening. I put them together. Okay, yeah, INS mapping recurrently.

**Sam Hatoum | 35:29**
We think consistency mapping with early Shopify like the impact of that would be... What I like... Would we lose something if we're...

**lance.fallon@llsa.com | 35:39**
Mapping the right thing that'd be pretty high.

**Sam Hatoum | 35:41**
Yeah, it'd be high all right, what's the likelihood of this happening? We don't do it right? It's high.

**Speaker 3 | 35:49**
I mean, like can one typo could cause that.

**Sam Hatoum | 35:53**
Right? Let's put it there as well then. Next one.

**Jennifer | 35:57**
We were talking about this one, let's skip it for now. Excessive bills charging to customers I would say that's high impact but low likelihood. Legacy order participant duplication of participants.
Low impact. If it's duplication participants but high likelihood.

**Speaker 3 | 36:34**
Yeah, I agree. You have participants, right? They just stole their name slightly differently than the call center would input. You get a duplicate, it'll never match.

**Sam Hatoum | 36:44**
The wrong one.

**Jennifer | 36:47**
There we go. Okay, Data Breach, High Impact team, how do we feel? Higher or low?

**Wesley Donaldson | 37:03**
It's just like a larger data. It's like wrong data presented to customer like sensitive data.

**Jennifer | 37:12**
Right now, we are still reaching this. So I would say hi.

**Sam Hatoum | 37:17**
That's true, we've seen evidence of that, right? So the likelihood is high and then the impact is high. So cool.

**Jennifer | 37:24**
Whether or not it's due to us or just the processes we have in place... Participant merging.

**Wesley Donaldson | 37:32**
They pro the impact on this would be high from a business data perspective over here.

**Jennifer | 37:44**
Thank you. I am getting... These are too far away from me, I need to move these down.

**Wesley Donaldson | 37:51**
Keep going. I got...

**Jennifer | 37:53**
Thanks. Okay. Participant merging incorrectly so we had before duplication. This is merging with the wrong participant, so this would be that. Data impact. I would say this is low as far as likelihood, but high impact.
If it happened, the user could complete checkout due to item combination. Likelihood...

**lance.fallon@llsa.com | 38:43**
What was that scenario?

**harry.dennen@llsa.com | 38:46**
This item the elimination... Your cart's in an uncheck out bowl.

**Speaker 3 | 38:53**
D is this more like recuurly configuration.

**Jennifer | 39:03**
Or like recurring something?

**lance.fallon@llsa.com | 39:05**
Or we have something in our code that's wrong?

**Speaker 6 | 39:09**
Yeah, they cannot complete the funnel for whatever reason. Actually, it's even worse than every part of them cannot complete it.

**Jennifer | 39:17**
I would say it's a high impact.

**lance.fallon@llsa.com | 39:21**
I can't check out that impact.

**Sam Hatoum | 39:24**
Likelihood.

**Jennifer | 39:25**
What's the likelihood?

**Sam Hatoum | 39:38**
I don't really know.

**lance.fallon@llsa.com | 39:39**
I don't know what's causing it that so...

**Speaker 3 | 39:42**
If it's recurring, can it be...?

**Jennifer | 39:46**
Hopefully not for all of the different things. How often do you think we're going to see this?

**Sam Hatoum | 39:53**
I would be... Because it should have gone through the lower environment first of all before it was tested and so on. But there could be some human error. It's low, but it's there.

**Jennifer | 40:04**
Okay, that Miro... No emails being sent.

**Sam Hatoum | 40:15**
What's the impact? From a likelihood, I think it will be low, but we can... It's just an event coming in and then a call going out. As long as that system's working, then we... Slow likelihood. Pretty straightforward.

**Jennifer | 40:36**
We are not able to be screened at the appointment at the wrong time or the wrong appointment. I would say if they get there, I don't know what the cleanup processes are like. If they get there and there's something wrong, are they able to create a new order?

**Speaker 3 | 40:55**
We treat them like a walk-in, right? I think we handle that with the double-booked appointments as well right now. Business of the process around this.

**Wesley Donaldson | 41:08**
It...

**Stace | 41:08**
There is a mitigation process. It's just not a great experience for the customer.

**Speaker 3 | 41:13**
Of course we'll get...

**Stace | 41:14**
The complaints the next day. But there is a mitigation process.

**Jennifer | 41:19**
Low likelihood or high likelihood?

**lance.fallon@llsa.com | 41:26**
We hope it's low.

**Jennifer | 41:35**
The last one, the one that we were talking about, I guess where do we want to put this one? Is this a user can't complete checkout due to item combination? Same as this?

**harry.dennen@llsa.com | 41:50**
Yeah, it's probably that. Okay.

**Wesley Donaldson | 41:54**
When we spoke about it, it was more like not enough orders coming through or something to the effect of the system is... We're not seeing what we expect to see.

**harry.dennen@llsa.com | 42:00**
So yeah, it could be due to a checkout combination or an incorrect combination or any number of things. You know, if we have five things that people can buy and we only see them buying one...

**Sam Hatoum | 42:15**
Something is wrong.

**Wesley Donaldson | 42:17**
I think the pattern was the idea here. Like it's a. It's a perfect pattern. Signal.

**Jennifer | 42:24**
Okay, I would say it sounds like if we find that something's not getting sold, then we can look into it. So I would say low impact guys like Playhood.

**Sam Hatoum | 42:44**
Have no objections. We'll go in with... All right, so next step, obviously the biggest items, the high... So if we can just look at those and just re-enumerate them one more time, please. Where did we get here?

**Jennifer | 42:58**
Infrastructure issues.

**Sam Hatoum | 43:00**
Okay, infrastructure issues, data breach and consistency mapping recurring bits and bobs over there. So I think one thing we do is for the architecture session next week, we bring some of these in and see what we want to do about them and schedule some work around them because they're definitely the biggest item you want to hit.
Then I think in the next ones are the high impact ones. I would say even if there's a low likelihood, you should look at those because the low impact, high likelihood of a problem. But I would say big intri... Let's bring this matrix into our architecture sessions and see which ones we want to deal with and what we want to play. Thank you so much, everyone. This was super helpful.
And don't have any final things they want to add. Anything that's popped up is like, "One more thing." A bit of a Colombo moment if you know what that is. If you're as old as me.

**Jennifer | 43:55**
Or any of the late joiners.

**Wesley Donaldson | 43:55**
Three.

**Jennifer | 43:57**
If you have any new ITSM no.

**Stace | 44:01**
I think this exercise is good and something I'd like everyone to think about in the back of their heads as they're picking up stories as they're doing stuff right. There's anything you don't trust about the system you're being asked to build. Let's surface that so we can figure out a way to trust it.
I think based on just past learnings from what we've had and thrived so far, the key here is really observability, right? If I were to play Chaos Monkey and go route Amazon users into the console directly into a Lambda and break it, how long is it going to take someone to notice?
Kind of thing, right? Because if we know quickly, we can respond quickly.

**bethany.duffy@llsa.com | 44:45**
I joined pretty late, so just a really quick recap of the things that we see very often today. Things are double booked deployments, unable to create the order in our legacy system, and payment issues.
But I think the payment issues may be more related to our gateway and not what we've built. So if those have been covered by stickies, then we're good.

**Sam Hatoum | 45:12**
To some degree. I don't think we're the double booked appointments. You know, that's a good one to definitely to consider.

**Jennifer | 45:17**
We have this one right here that includes the double-booked.

**Sam Hatoum | 45:23**
Okay.

**Jennifer | 45:24**
Do we want to move that up to high likelihood?

**Sam Hatoum | 45:28**
I was like him.

**Wesley Donaldson | 45:30**
Is payments? Not being charged or not being captured or not being correct? What's payments?

**bethany.duffy@llsa.com | 45:37**
Yeah. Just general discrepancies in payments because we are using basically a proxy, and I am assuming Recurly may work as our gateway here. What we see today is that our gateway assumes a response from our processor that is incorrect.
So at the end of the day, the charges don't match up between what actually hit our bank account and what we thought we collected.

**Jennifer | 46:10**
Do we want to move this excessive bills charge to customers up? Or is that not something that we think is a high likelihood in the new system?

**Stace | 46:22**
I think it's a low likelihood, but it might be a question of again, observability. Where... How would we detect that?

**Jennifer | 46:34**
That might be more of a medium...

**Stace | 46:36**
Is intelligence task than an APTP task?

**bethany.duffy@llsa.com | 46:39**
But I think the failure into legacy insertion is probably the biggest concern and the biggest downstream impact. And that could be for a variety of reasons, right? Necessary information was missing in the payload and wasn't sent over, and the appointment time is no longer available. There's a mismatch on the package information.

**Jennifer | 47:05**
And is that the sign?

**bethany.duffy@llsa.com | 47:10**
The invoice to Shopify.

**Jennifer | 47:15**
Me just put order fulfillment.

**Stace | 47:19**
Yeah.
Okay. When we reclassify these or as we dig in deeper, I think one of the impact things we could weigh into is it recoverable or not? That could actually lower our impact score because we can replay a queue. We can go to recurring and get them back out.
If they didn't get in a C star, there are things we could do that lessen the impact a little bit. Again, as long as we're aware of it, we can fix it. I think the highest impact things like bugs that might cause ecommerce, right? Bugs that might just cause customer abandonment, right? Where we just lose all chance to do business with them.

**Jennifer | 48:02**
Yeah, that's why it was like for this one conversion rates thing.

**bethany.duffy@llsa.com | 48:11**
That's something that the business side pays very close attention to. So if conversion rates are lower than expected, we usually get a note about it very quickly.

**Stace | 48:21**
Yeah, we will, right, because they're tracking.

**Jennifer | 48:23**
The Clin over here like that. I feel like that should be a higher impact than... Or do we sell it as medium?

**Sam Hatoum | 48:40**
I think it's good that we captured it. So, I've got to dash to another call. But there's a great list for our architecture session. Then we can have another one of these if we want to. Just before the call, I think we said we're going to have one more. This was a pre-mortem.
I think the next one we're going to do is a simulation. So, we'll have another exercise like this pretty soon, but this is great. Let's go with this. Let's take some action items, put them in the system, and then do it again.

**Jennifer | 49:07**
Thanks, everyone.

**Sam Hatoum | 49:09**
Thanks, all. I'll see you all at the next call.

**lance.fallon@llsa.com | 49:12**
A good one.

