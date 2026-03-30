# Mandalore DSU - Mar, 30

# Transcript
**Wesley Donaldson | 00:06**
Good morning.

**francis.pena@llsa.com | 00:09**
Good morning. Good morning.

**Wesley Donaldson | 00:34**
I hope everyone had a good weekend. Go a little rest and ready to hit the week. Get this thing launched. Alright, guys, I guess the first thing I want to just call out. We'll... Sure everyone's already seen it, but if you haven't, if you can please take a look at the first message in the Slack channel this morning. We just outlined some action items for us, called out some specific tickets as well as just things that we pulled from our working sessions on Friday.
So please take a look through that. Once you've closed out something, if it's not related to a ticket, just let me know. Please. Otherwise, just update ticket status. All right, let's jump straight in, shall we? Already connected with Francis, let me see if Antonio... You are not... That's fine, Francis, let's start with you.

**francis.pena@llsa.com | 01:42**
Okay, I have the API gateway locks, which is I'm going to get an APR for that, and then I'll look into the bindings for the... I com server.

**Wesley Donaldson | 01:48**
Okay.

**francis.pena@llsa.com | 01:54**
ECOM three ABI server.

**Wesley Donaldson | 01:57**
This one. You have a PR. Great, any thoughts on the load for this? Is this something we think we could...?

**francis.pena@llsa.com | 02:02**
I think I can finish that today, maybe in the next couple of hours. I already moved it to "in progress," so I'll work on it.

**Wesley Donaldson | 02:08**
Okay, perfect, let's go to Jeremy to you next.

**francis.pena@llsa.com | 02:11**
Yes.

**jeremy.campeau@llsa.com | 02:22**
Sorry, I couldn't find my... I just put the membership changes into the development environment, so I'm testing it now on my e-com branch, and then I'm going to pick payload one. I read your message, and I think the schema one should be in review.

**Wesley Donaldson | 02:38**
What?

**jeremy.campeau@llsa.com | 02:43**
I think Antonio viewed it once, but then we talked about how the Dunning campaign stuff they needed a lot less than we thought. So that one, I think is in review, and I'll just have to talk with Antonio. One of the tables I want to get feedback on specifically.
So that's where I'm at.

**Wesley Donaldson | 03:03**
For the mapping? I have a meeting on my calendar for tomorrow, I believe, just to sync with the BI team.
It's in progress work. It doesn't have to be final, but if you can have the review with Antonio before then, that'd be ideal.

**jeremy.campeau@llsa.com | 03:18**
Do you want me on the meeting? I don't have an invite for a meeting tomorrow.

**Wesley Donaldson | 03:20**
Well, that's my miss, and I'll add you to it. I may have just duplicated a meeting and not added you to it, so I'll add you in. For the issue that we identified on Friday, this guy... What are your thoughts on...? Is something that we can tackle today or, more importantly, is it something that...? It's already finished.

**jeremy.campeau@llsa.com | 03:36**
The membership fix is already finished.

**Wesley Donaldson | 03:39**
Okay, can I fla.

**jeremy.campeau@llsa.com | 03:40**
Yeah, I just did it. I just tested correctly on the membership API itself. Now I'm just running all my test cases in the ECOM API with the change for the recurring user to make sure that it's working.
But it should... I'm just double-checking, and then I'm going to pick up the payload one.

**Wesley Donaldson | 04:01**
Sounds good. Obviously, there... All right, LANs, over to you.

**lance.fallon@llsa.com | 04:10**
Hey, I deployed the SQS stack to production this morning and then provided the a RN and the URL so there's variables can get set up.

**Wesley Donaldson | 04:11**
Morning.

**lance.fallon@llsa.com | 04:24**
I'm looking at the membership renewal ticket right now because there were some tweaks we had to make to the payload. I did have a couple of open questions on this one as I was looking more into it, and then I discovered that the subscription renewed event doesn't actually indicate if the payment was successful.
So it's not technically a complete subscription renewed event as far as I can tell. So I wanted to know if we should be sending those to legacy if the payment fails.

**Speaker 5 | 05:08**
How is it I. And.

**lance.fallon@llsa.com | 05:14**
Secondly, I see a number of monthly memberships set up and monthly plans set up in the sandbox. We're hard coding annual to true at the moment but I wanted to double check that since I did see monthly plans.

**Speaker 5 | 05:33**
Yeah, we are migrating the monthly plans. I would check with DJ to see if he needs that value. If he does, then we'll have to dynamically change it.

**lance.fallon@llsa.com | 05:43**
Okay. And if this might be another DJ question, but if we are doing the monthly, the unit amount, which I'm working on mapping now, would we want that to be a monthly amount or the total for the year?

**Speaker 5 | 06:03**
Whatever MMA needs to continue the process. So the goal with this integration is just to allow the call center to schedule appointments against the membership, appoint the memberships side. I don't know.
Yeah, I don't know enough about the monthly appointment or the monthly subscriptions to know what it needs.

**jeremy.campeau@llsa.com | 06:30**
We will need a ticket for the ecom three API to handle the monthly. I think right now we're just looking for the year paid in full.

**Speaker 5 | 06:43**
Do we are we using the ecom API for renewals or just new subscriptions?

**jeremy.campeau@llsa.com | 06:50**
Just new subscriptions, is it not for the new ones?

**Speaker 5 | 06:53**
No, this is for our renewing, like our annual renewals that we already have, so we do not have a monthly that we'll be selling new, it's just the annual.

**jeremy.campeau@llsa.com | 07:03**
Okay, got it. Sorry, never mind them.

**lance.fallon@llsa.com | 07:07**
Yeah. This is set up on a different API, I believe but I know DJ set this one up. Okay, yeah, just working through that one. So I'll reach out to DJ.

**Wesley Donaldson | 07:20**
So there's a Slack message, Lance, that you provided. I'll just... If we want to converse there, I'll pull the information back into the ticket. You mentioned that the... I think what you mentioned regarding the pipeline going in production. I feel like that's this ticket here, or a little bit of all three of these. All two of these. Can I move both 7809 and 771 to production to...

**lance.fallon@llsa.com | 07:47**
Yeah, the middle one is the Thrive stack, and the bottom one is the legacy e-com API, but I drive one is definitely deployed. Then the legacy one is what we were working through on Friday.
So I think that one is in a good place.

**Wesley Donaldson | 08:10**
And this same idea here that should be in production. Are you going to wait until we kind of get through the questions you have?

**lance.fallon@llsa.com | 08:22**
I think that one is pretty specific to order placed. Which I think is like... Why don't you keep it there for a second? I have to talk with Jeremy about how we're mapping the item ID after this. I don't know if that will require a change.

**Wesley Donaldson | 08:37**
Okay. So we'll leave. Seven for seven. Mihow?

**Michal Kawka | 08:47**
Hi everyone, I wrapped up the ticket implement tracking... No, sorry, that's the wrong one. I'm sorry at blue-green switch to webhook... Already reviewed that it's approved. I'm just testing.
So I tested the workflow on that and prod branch. Just the check status. I didn't check Legacy yet. I have quite a few PRs which are ready for review, so I'm going to chase people down to review them. We've reached an agreement on the icon styling with Beth, so it should be closed today. Same for the record tracking and the other two ones related to the alerts and Lambdas basically.
Yeah, alert. Yeah. These are alerts that are going to be... Today. I'm going to work on the ticket that you're currently displaying. It was later today. Once I merged my ticket into...

**Wesley Donaldson | 09:48**
Okay, so then by the end of the day today we'll have the tracking, we'll have the chat icon.
Antonio, if I think I asked you and me how just to pay on just the environment and final walk through of that. So we'll have the final production blue-green switching completed by the end of the day.
Okay, sounds good. Sorry for the epic regarding the AWS triage there. Jennifer had asked for an RFC for us to spend a little bit of time and figure out what our approach or what our thresholds need to be by the different park event category.
So just pull that together. I'd love for us to be able to talk about it as part of the architecture meeting tomorrow.

**Michal Kawka | 10:32**
Sure. Thank you. Just a quick heads-up. Sorry, my tongue is broken. Today I will be on vacation starting on Thursday until the 13th of April.

**Wesley Donaldson | 10:45**
Okay. So make sure we hand off those items from you. Thank you. Let's keep going. I go over to you...

**Jivko Ivanov | 10:58**
Yes, certainly. Good morning. So on Friday I completed the 741 the coupons. Thank you very much... For the prompt attention there with multiple iterations and finally the PR was merged later in the day. Today I am picking up 8110, just looked through all its requirements and posted a question there. This particular script cookie consent. It has an ID.
So the question is, do we want to use just a single ID across all environments? Is that the production idea that is there in the script, or is there another ID? Basically how we're going to handle production from non-production. The way I'm doing it right now, I'll just add the environment available, but ultimately need to plan for the production deployment.

**Speaker 5 | 12:01**
I would say just to be safe, let's do it like we did with the GTM so we're handling it in a config file so we don't have to deploy if we need to change it.

**Jivko Ivanov | 12:15**
Okay, I guess. Okay, so config. Yes, but file I wouldn't recommend. It's probably just an environment variable which you can configure per environment.

**Wesley Donaldson | 12:24**
Yeah, that's what she means. I think we're the other one. We were using a GitHub variable, so let's just follow the same convention, right?

**Jivko Ivanov | 12:32**
Well, yes. That's what I'm going to... Thank you.

**Wesley Donaldson | 12:36**
The only other one for you. I'm fine with pulling this back into the refactor for after launch. We need to pair yourself, myself, you, and Antonio. I'm just double-cleaning up all of our events going into Century, our events in a... So I'll set a meeting up on the calendar for all five of us actually to pair on all things related to just observability with... Versus Century. That'll be on the calendar. I'll target maybe if not today, then probably Wednesday. Who has not gone? You, all us. Actually, you have not gone.

**Yoelvis | 13:17**
Hey, today I've been working on the setting up the playwright test. I found, a few tests are broken, so I am fixing the continuous interation test and trying to make sure they run fast and are mocked for the PR environment.
So the idea is for PR environment. We can run the NN test quickly.

**Wesley Donaldson | 13:48**
For the items that you have been ready for. Prad. Which of these can we move to? Officially done.
Like I' I'm harping on blacksmith specifically, but generally which of these can we must move to Dun?

**Yoelvis | 14:00**
The blacksmith, the fix destroy PR those two. The BO is still checking some of the other two tickets, some of the ballot points, so.

**Wesley Donaldson | 14:20**
No worries. And Antonio, you are last. Good sir.

**Antônio Falcão Jr | 14:24**
Hey, guys, good morning.

**Wesley Donaldson | 14:26**
Morning.

**Antônio Falcão Jr | 14:28**
I've been working. I mostly focus on the 07:08 because there is some cascading independence to the 7:10. I have reviewed and have a plan set up to start implementing this one. As soon as I finish 7:7:08, I'll be able to just propagate the change to the 7:10. Those two may walk quite together. I intend to have APR ready by the end of today. No blockers
so far.

**Wesley Donaldson | 15:09**
Be aware, team. Thank you, Antonio. Be aware, team, there is a... I think a 130-minute session on your calendars. For us, just to do a walk-through session again. We're going to... The goal is to review all the status of the bugs. I put that in the agenda. All the status of the bugs and then review the end-to-end on the sandbox again.
Then review at least one order end-to-end in the production environment. So those are the goals for the meeting. Please message and chat. Message me directly if we see any blockers to getting to those goals by the end of the day today. Reminder for folks, we're looking to have the business go through the experience end-to-end this week. Ideally, it's starting today.
So if there's anything you're seeing that you are tracking or anything you're coming across, please flag it. Let's make sure we have eyes on it. Thank you guys so much.

**jeremy.campeau@llsa.com | 15:58**
My guys, have a good one.

**Wesley Donaldson | 15:59**
Have a good day.

