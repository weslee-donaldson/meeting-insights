# AppDev Leads DSU - Mar, 16

# Transcript
**harry.dennen@llsa.com | 00:06**
I mean, this is the first time I've had... [Laughter] No, I have some training, and I was looking through it because I was hitting "Next module" to the next.

**Wesley Donaldson | 00:09**
Good morning, all. Did you just say you have time to focus on some priorities there, Harry? Is that...?

**harry.dennen@llsa.com | 00:25**
So I did the quizzes, but I hadn't watched all the videos.
So busy getting through that.

**Wesley Donaldson | 00:30**
I missed, like those mandatory trainings, like all leadership good times. What does that, let's say, require every quarter for that or every year fairly?

**harry.dennen@llsa.com | 00:43**
I think it's yearly.

**Wesley Donaldson | 00:44**
Okay, that's not bad.

**harry.dennen@llsa.com | 00:46**
No, but there are two sets, right? There's a continuous stream of secure cybersecurity ones, but then there's a separate set of healthcare-related stuff like waste, fraud, and abuse, harassment, and stuff like that.

**Wesley Donaldson | 01:02**
Anti-bribery, things like that.

**harry.dennen@llsa.com | 01:04**
Yes, that's the one.

**Wesley Donaldson | 01:06**
Yeah, good times man, good times.

**Jennifer | 01:11**
I think it's just us today because... Lt, and then Beth is not feeling well. So she will not be on. But we can probably get started. Wes, why don't we start with you?

**Wesley Donaldson | 01:23**
Yeah, sure. Did you share?
Okay, priorities first, so let me... Is working through the final portion. I guess 2000ish based on the plan for only doing 2000 at a time.
So we agree that we're going to run those for Wednesday morning. No issues if Ray changes his mind, it's just an existing script. Happy to kick it off a little bit sooner. The post-mortem. Like me, how was getting this into Confluence for us?
I asked him to timebox this to just an hour. This is already known. I just needed to be represented where it belongs. He agreed that this should be a quick fix. So just pushing that forward, additional things that are off the... Realm that he's tackling for today.
I've asked him to prioritize his next task. Just getting through... I'm sorry, let me just make it easy for us to see this. I've asked to prioritize just doing the sweep around blue-green because that's what the post-mortem is.
So tackling the sweep to make sure anything that is still possible concerns or issues. He did that as part of this alerting audit. So this should be a pretty quick task, but just asking him to time box that as well. Assuming he gets through these two tickets today. My plan of attack for him is just I want to get him on some commerce-specific work.
So the goal is to get through today and then be able to pivot him to commerce-specific work. What commerce work? The team is really tucked in right now, I think, on just still closing out issues that were related to MVP so if we were to just look a little bit broader... We have stuff from the recurring MVP refactor epic defects mostly that are still in ready to... That are still in review and still in ready for prod. There's still stuff that... Like you all... This and Jeremy are working on.
So I've repressed to the team the urgency of getting these off our plates so we can focus exclusively on the recurring and additional features within recurring. We are making some progress on recurring tasks, for example, the CDK stack that Jiffco is working on, the blue-green work that Antonio is working on.
So there is progress being made around those epics. But I view Germany as one of our key SMEs around C Star around recurring generally. So we need to get him on recurring as soon as possible.
So that's been a little bit delayed. More delayed than I would like. One challenge, Jennifer, that I see on the board right now is we plan to take in beta smaller tasks and have Jeremy tackle those. I'm planning on pivoting that to actually have me tackle those. That way, Jeremy can tackle some 1.2 specific items.
So let's just look at that specifically. So the plan was for him to take a look at the chat, take a look at some minor changes and minor feature additions within checkout. So these are probably going to fall now to me. How just to get up to speed on the recurring UI and that way he can be a resource to tackle some of the additional things that product may have and allow Jeremy to start tackling more critical things like this payload mapping task.
Right? So this is going to be the most critical, I'd say critical path for us getting through the 6703 epic and being able to push orders into recurring. So pushing for him to tackle that pretty much starting late. Latest end of day today again, keeping our vision a little bit higher than just individual tickets. One of the worries I have for the team is Stacey's direction and goal that we want to start seeing things come to see Stacey this week.
It's like midweek sounds like ideally what he was pushing for. My worry is we're still here in the process. We're still on the ingestion step. We've made progress here. We've made progress on the CDK. Antonio is tackling this ticket.
But in my mind, the best-case scenario is Wednesday when we would have the ingestion epic done. Then the best-case scenario is probably the end of the week when we would have the hydration into C-Star being able to take things out of Thrive and push them into Event Bridge and getting them into that epic, that Econ 3 LLaMA econ 3 API to push them into the system as Shopify orders.
So that's feeling like the best-case scenarios end of this week. I fly that as a concern with the team. We're having a quick sync and just clarifying if we have the right folks on the right pieces of work and then looking for them just to speak to like, "Hey, the direction of the hope is Wednesday and Thursday for getting that order information and if that cannot happen, what's our best as a team to get that for?"
Maybe best... Friday. So that's the big concern I see right now in the work. But beyond that concern, people are tucked in and they're... We're clear what our priorities are.

**Jennifer | 06:25**
Okay. As far as getting stuff into CSTAR, is it possible that we can... Just maybe not have it work completely... Not get a successful response or something like that, but just getting everything hooked up?
I think that might be the goal or something like that, just so we can show that. I just don't... I think that the goal is to not wait for everything to work perfectly end to end and to get things starting each piece to make sure that it's getting hooked up so that we can make sure that we have that connection at least to CSTAR, even if it's a failure response.

**Wesley Donaldson | 07:19**
Yeah, let's test-driven development, right? Let's at least create the test, prove that we can fail, and then we can fix the actual issue. I think that's as...

**Jennifer | 07:27**
Exactly. Because that way we have any network issues out of the way by the time we're trying to get data.

**Wesley Donaldson | 07:33**
Yeah, I mean, I didn't build out the tickets that way. Full transparency, but I think that's a great way of approaching it.
So just asking folks to just prove that the elements exist like "Hello world", effectively making the connection and then have the business logic, the distinction there is make connection and then business logic.
So yes, I think we can tackle that. I my plan was to open the conversation for moments like that in our call this afternoon, but I'm going to bring that to the call instead.

**Jennifer | 08:02**
How good? Perfect.

**Wesley Donaldson | 08:03**
I invited you to that. I didn't make it a larger team.
The rationale behind that is we already have the refinement. I don't think we need to rehash this. This is clear to me. The tickets that I like, this is clear to me is just more about what the blockers are, how can we work as a team to ask for help or can we tackle it?

**Jennifer | 08:23**
Yeah, okay, thank you, Harry.

**Wesley Donaldson | 08:28**
Cool, that's it for Ador.

**harry.dennen@llsa.com | 08:45**
We have a couple... I'll start with blockers. This internal gateway still blocks Francis from trying to get this new domain of whoever's supposed to be doing that for us. He's going to follow up today, so we're still stuck there. He's doing a bunch of alerting stuff.
So trying to get that stuff in order, there are a bunch of tickets around that alerting. The other one is the Shopify issue. We don't have a root cause yet. Nick replayed. He manually updated. Like we said before, he added the last names. Replayed them. Some of them went through and created orders, some of them just showed that they hit the event bridge.
We're still... The number is not seventy-something anymore, it's a hundred and something. It's not always the same issues, right? So it's not just last name. Sometimes there are weird things with the order.
So something is going on with the data that we're getting from Shopify and we don't yet know why. Nick has spoken. Yes, so Nick has spoken with Jeremy. Dane ended up... Ate a lot of his time last week as well, which is why this stuff is still sitting on the board.
This one's becoming more concerning now. I might have a look with them this afternoon and try to figure out what's going on. Onto we have the Cognito creation stuff. So he just has a bunch of build issues there.
So the first one, this one's going in now I just fixed that, which is the stability one I wanted in. The other one is all those conditions. We had a look at that, and the conditions for creation are getting complicated, especially once you introduce email and phone updates that we'll create.
So we had a discussion this morning about it, and it goes back to that original discussion around using a first scene to avoid all this and just say when to do it. So we're just going to do the order created and participant first scene together.
That's simple. That should cut down on 80% of the false alerts.

**Jennifer | 11:08**
So it sounds like there are changes to the plan. So we should have another get-together and talk through that.

**harry.dennen@llsa.com | 11:17**
Okay. I think the concern now is that there is a potential for... So the original one is we default to creation if it has nothing right, because at least it's there. If you run an update, they get the new email, the phone, and it works again, right?
Because it's to try to maintain a path where Paul Center can actually fix the person's problem, whereas if they don't exist, they can't do that. Now that does happen once we start adding the email and phone updates, but there's a potential where, if you end up with a big impact on call center to avoid creating extras, then it negates a zero sum.
So we can have a check-through that because I have a feeling this is an 80-20 thing where it's on the order of tens of no operation creations or creations that shouldn't have happened.
If you just do the order and participant right. What I'm saying is you can probably avoid the complexity of the other cases and still come out ahead with regards to call center volume.
But yeah, we can chat about that more. At any rate, that would be the first protocol anyway. I think he was trying to do everything in one go, which is not what I wanted to do. Stefan has broken this up into individual pieces so these will start coming across and we can actually get the coverage and not on a gigantic thing that lasts forever from this bug, which should be straightforward. After that, he moves on to the we discussed last week around LLM membership so DJ and Firman know what they're doing here. The goal is this week, but I think DJ is dealing with live things and Firman hasn't yet gotten onto it.
So I'm saying, by next Tuesday we definitely have this, but we're shooting for this week. On the other one that we wanted to date for, which is the status management 1.1, if everything went well, I'd say this is a week. The only complex one is the one where we have to touch polling service around augmenting what we get from the field.
That is a larger piece of work. The other ones I imagine can be done this week, this one probably into next week. So I put ten for both of these March 24th, which is next Tuesday, which seems reasonable.
If the Shopify thing gets out of control, that's going to eat time. If there are a bunch of legacy issues, that's going to eat time on DJ's for the other one. So those are the concerns and that's the goal and that's everything.

**Jennifer | 13:52**
Okay, the MMA stuff is a huge priority. We're going to start having a lot of issues if we can't get that in because they are turning off jobs and they're starting to do stuff on Curly. So we do need a way to manage those statuses. What I'd like to do is if there are things that are coming in that are preventing that from happening, then we need to have somebody else take care of that stuff.
Okay? The main stuff that needs to get done is the stuff that DJ is working on. Firman stuff, of course, is like the alerting and everything. So technically, that's okay if that goes over... Because we can manually handle the alerts for a couple of days, but DJ stuff does need to get done this week. Or at least... We shouldn't have anything else come into DJ to prevent DJ from getting that done this week, if that makes sense.
I don't want to have anything.

**harry.dennen@llsa.com | 14:58**
Yeah, noting that.

**Jennifer | 15:01**
Okay, so however we can manage that, just let's get those first two done. Then you had mentioned... Sorry, it sounded like Dane's name came up on a lot of different things. What's your number one priority?

**harry.dennen@llsa.com | 15:23**
Number one is just wrapping this up so that he can get over to the status management stuff. These two were quote done the exception, the stability stuff is done. He's just fixing the build issues around...

**Jennifer | 15:40**
Snapshot of the build issues.

**harry.dennen@llsa.com | 15:42**
The snapshot, yeah, it's that standard one. But this should go in today. I think he got caught up with helping Nick into the Shopify things, so that's where his time went in the last week.
Then this one, we're just going to do the one case that I wanted to get done, and then we can have a conversation about how we go forward on that because at least that'll make a difference in the creations, right? Without having to do every single one.
Yeah, that's it. It's this Shopify thing.

**Jennifer | 16:20**
Okay, so let's have Dane not...

**harry.dennen@llsa.com | 16:25**
Look at this.

**Jennifer | 16:26**
Well, I'm just... I just want to focus Dane on not three things.

**harry.dennen@llsa.com | 16:31**
I agree. Because I don't see why Nick and Jeremy can't deal with this.

**Jennifer | 16:38**
Okay, and then I did want to get to that next. Okay, so then for you, you're focused on getting started or...

**harry.dennen@llsa.com | 16:56**
Yeah, I'm trying to get Dane stuff in so that we can all get over. We need to. We need to get onto the status management.

**Jennifer | 17:07**
Okay. So no one's able to start the status management until we get the stability stuff, the cognito stuff, and the Shopify stuff.

**harry.dennen@llsa.com | 17:17**
Well, I mean, if Nick and Jeremy can handle the Shopify stuff, then Dane and I can immediately get on to the status management, and then that should... You know, the first...

**Jennifer | 17:25**
So you guys have the stability stuff getting that done, and then we've got... Yeah.

**harry.dennen@llsa.com | 17:34**
Not I'm saying it's not... Everybody, right? This shouldn't take everybody's time. Once these are done, Dane and I are on membership status management.

**Jennifer | 17:49**
Okay? But until we get the stability, the cognito and the shot like or like those are the three things that are blocking us right now. B okay, so focusing on those today and once those are done, that's when we can get onto the stability or once one of those are done or I guess two probably.
Okay, so we talked about the stability. So he's going to focus on that today, get that in because that's been sitting there I think that's been sitting there for a week, right? In review.

**harry.dennen@llsa.com | 18:29**
Yeah, a week.

**Jennifer | 18:33**
Yeah, okay, it's...

**harry.dennen@llsa.com | 18:37**
Then the problem is it was reviewed by Antonio, it was reviewed by me. And then each time they get reviewed, then he's got more issues from me and then he... But he's busy doing something else. So it sits there for it to merge.
Okay.

**Jennifer | 18:55**
It's it being a P1. Just have him, like, after it gets reviewed or whatnot, like, try to focus on getting that one. And. And then if you and I want to chat about the cognito stuff, we can have that chat. I just want to make sure stacey's. Wanting to make sure that we're not updating too much without, like, all having, like, that discussion and making sure that he's aligned with that.

**harry.dennen@llsa.com | 19:26**
Okay.

**Jennifer | 19:27**
So you and I probably can meet right after this and chat through it and see where we're at, okay? Okay, awesome. Then, Wes, it sounds like my's been helping Nick with this one. Is that going to impact you guys?

**Wesley Donaldson | 19:51**
Yes. I just need Jeremy to be 100% focused. The thing that he's assigned to is probably the most important task because it's how we actually turn recurrently into something that Star can understand. That mapping task, which pulls in his experience on the POC for recurrently as well as his understanding of CS Star.
So it's a good amount of work there, and it's critical work. So if at all possible, maybe we can just try to get him freed up by no later than the end of the day today.

**Jennifer | 20:25**
Okay, sounds good. Hopefully, we can have... I think if we focus on getting him freed up by... Yeah. Okay. So let's say... Sorry. I was going to say by the morning, but then I realized it's midway through your guys' day.
So it's already noon, isn't it? Never mind. So by the end of the day. Okay, so, Harry, let's connect up about the Shopify stuff with Nick first and just see where we're at with that. Because it sounds like it's a Shopify issue, so maybe we need to be talking to the shop.
If I support... Rather than fixing it on our side because if it's not our issue, then I think we need to focus on Shopify.

**harry.dennen@llsa.com | 21:24**
That's what I was starting to think, is this us? Because there was a hunch around maybe a promotion or something was misconfigured, but it's that the issues we're seeing are not consistent.

**Jennifer | 21:37**
And we haven't changed anything, right?

**harry.dennen@llsa.com | 21:40**
I don't know. We can't answer that.

**Jennifer | 21:43**
I think Nick said we hadn't... Okay. So let's connect with Nick on the Shopify stuff first. Actually, before we talk about the Cognito stuff. To make sure that Jeremy can get freed up. Okay, thanks, everyone.

**Wesley Donaldson | 22:07**
Sorry, are we planning on...? Since Beth is out, you know if Ray or anyone else is doing anything for the product sync?

**Jennifer | 22:15**
I don't think products have anything. I haven't heard of anything. Sounds like Endor has a lot of issues to get through. So they're not having anything new coming in. You guys don't have anything new coming in, and Beth is out.

**Wesley Donaldson | 22:33**
The only thing... Yeah, exactly. The only thing we had was stuff we wanted to share, but it's not on fire.

**Jennifer | 22:42**
Okay, let's skip that one today unless I reach out in that channel and I'll ask if anybody doesn't have anything, then we'll skip it.

**Wesley Donaldson | 22:52**
Okay. Jennifer, just so you're aware, to give you as much context as you need in case the... As for any other stakeholder, I canceled the refinement meeting this afternoon. I just want to give the engineers more time on the keyboard and honestly, we have enough clarity from the architecture as well as from the state integration on Friday.
I don't think we need to go over those same epics again.

**Jennifer | 23:20**
I think he'd be aligned with that.

**Wesley Donaldson | 23:22**
Sounds good if he needs me to walk him through something, happy to do it as well, but I think we're good.

**Jennifer | 23:23**
We've had a lot of the refinement meetings in the past, so I think that's fine.

**Wesley Donaldson | 23:33**
All right, thank you, Josh.

**Jennifer | 23:35**
Yeah, he's more just wanting to be a part of it if you guys are having it, not forcing it to happen, so...

**Wesley Donaldson | 23:41**
Yeah, right, I up.

**Jennifer | 23:43**
Yep, no worries. Okay, thanks.

