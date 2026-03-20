# AppDev Leads - Weekly Sync - Mar, 20

# Transcript
**Jennifer | 02:39**
I was hoping other people would jump on by now, but since it's recording, I think we can probably get started with us while we wait for everybody else to jump on. Does that work for you?

**Wesley Donaldson | 02:55**
Yeah, I would love to be a part of this, but as it's recorded, maybe give her another minute.

**Jennifer | 02:56**
Or do you? Or would you rather wait for Beth?
Okay.

**Wesley Donaldson | 03:07**
Yeah, she was just with me on status. So here she just needs a little bit of time between meetings.

**Jennifer | 03:12**
I don't... That I see.
Well, now we have Harry and Ray. Harry, did you want to give your updates since we're still waiting on Beth for Wes?
You're muted if you're talking.

**Stace | 03:57**
I am in fa. Okay, [Laughter].

**harry.dennen@llsa.com | 04:07**
So yesterday the priority was... And then we would go back to this, but it looks like today this is P1, and so you just got to finish this stuff. I think he's almost there. I'm from what he said, he's just testing the code is done so this will be ended today. Everything goes well. The cognitive stuff we went through more changes.
I think we're moving away from the... After the EMME call and how we handle the events and how decisions are made. Even though this is in the old sort of aggregate set up, we're trying to leverage this here's the event decide what to do, you do the evolution. With that in mind, we're not leveraging the property specific changes and we're just running a check to ensure that this Cognito account exists in that way.
It's sort of encapsulated to that spot. The PER has been updated. Dan is fighting with a lot of test issues and build issues. Stefan's working on that. Apparently there's an issue with the visual regression and some other stuff that came up on another PR again, hoping to get this in today. This is pushing us out for the other work, the status management stuff.
So on to the status management. I opened a peer yesterday about the one piece status management comes into two parts. There's one which is on the initial FSA upload and then on any issues with results down the line.
So everything on the backside of that can be done, which I thought was most of it. The story I picked up yesterday is actually on the front side of it. So I've switched over to just doing the work for polling service to pull more data from CSTAR to put on the screening events that we get through those updates because we're actually going to have to leverage more of that.
I think the completion date for this is not going to be mid-next week. It's probably going to be end-next week because the issues this week, Nick has picked up the things that can be done on the backend.
So those are all results-related so that'll move forward today and then I think next week I'm actually going to move this.

**Stace | 06:38**
Over to pause.

**harry.dennen@llsa.com | 06:40**
Because he's only going to get to that next week and then Sens continued with the test. These two are ready for the banners out. It just needs to be merged and shipped. That'll happen today.
For minutes, moved on to some other break-fix stuff to keep space for DJ and that's it for the team. Got the other update? We still don't have an issue. We don't have an update on the DNS issue for the VPN, so the admin portal gateway is still blocked and we need product resolution on the 28 days after.

**Jennifer | 07:28**
On the 20 days after what?

**harry.dennen@llsa.com | 07:31**
Yeah. So if a person still doesn't have results after 28 days, we bump it into canceled because there's specimen lost or some issue like that. This is the backend of the status update, around results.
So Rinor said in our last call that he's waiting for something for clinical before we can...

**Speaker 5 | 07:52**
Yeah. The question was, "We can move to cancer, which is fine, but a lot of times that screening will have some approved images, so not everything is missing. Then if that's the case, how should we proceed?"
I think we can move everything to canceled and then just reschedule the lab test only, but I'm on that confirmation documented from the 24 team.

**harry.dennen@llsa.com | 08:18**
Yeah, and I think we probably need the full participant journey of, "I got my results, some of them showed up a month later. I didn't get all of them and moved to canceled. Then how do we reschedule, resolve, and then consolidate the order?" Something that they can see all the results and what that looks like on the front end.

**Speaker 5 | 08:35**
That's the thing we've got to confirm.

**harry.dennen@llsa.com | 08:37**
Yeah.

**Jennifer | 08:38**
Okay, there's... I'll probably bring this up after we give our updates. When I went to the backlog, there were a lot of production issues on both Legacy and Thrive that are going on.
So we can talk about how that prioritizes with the other tickets that you guys have. Okay, we...

**Wesley Donaldson | 09:23**
So I think we're complete with the rerun events. Completed the last round yesterday morning. So roughly about 1200 yesterday confirmed the channel. So this is effectively done. Other things that we've made good progress on...
I think I mentioned this yesterday. We've completed the webhook URL, the webhook to getting information out of re-Curly and having that over to our current DB and the easiest way to represent that is actually the core thing that was missing from this idea of completing all the ingestion. There are some smaller things around the edges that are still outstanding, but the core idea of getting the webhook process to be able to push it to QA, be able to hydrate, and pass it down to current, that core flow from a unit perspective is not complete. We're focusing now on how to demonstrate and prove out that system. There is a ticket that Antonio put in review today specifically tries to address that. We're creating an end-to-end script that allows us to push orders in an automated fashion from the checkout process into current to allow us to test different scenarios.
So that's the core. Can we push through the order ingestion? Some things that were identified yesterday are flags that we follow up on. We have tickets in place for them now, and we're doing a little bit of refinement.
These are smaller items, so don't be too concerned. These are things like confirming the URLs, confirming what secret or signature we're using for actually connecting recurring to our production instance, and some additional instrumentation around how we're handling event queues, event queue misses, and where we're pushing those notifications.
So just some items that we identified that are being added to Epic 1.101.2 for recurring. Nothing that's going to blow out our scope. But most of them are things that I think are for Francis, actually, that he's already aware of, and then a couple of things are for Antonio as well, but nothing where I feel that it's a risk to our time or our proposed expected timelines. Some additional things on my house plates specifically that are relevant to this conversation. He had a lot of items, a good amount of items that were not features specifically within recurring water processing.
So those are things around the SRI track. All those are in good standing now. They're in review, and he's just the team is a little heads down and getting through completing. So his reviews are a little bit slow, but they are good reviews, good standing, and we've gotten a couple of reviews from Harry and just... Andor and myself as well around some process stuff.
But he has a few things he will be able to share with us as part of the review. I think the biggest one is just to address some of the resource issues that we have. He's the stick. He's made progress on the stick and is able to demo it today. This is the ability for us not to always incur the high resource costs whenever we do a PR environment.
So now engineers will be able to explicitly ask for a PR as opposed to just always getting it even for a markdown change. So we'll be done with that. He's made some additional fixes around... We had an outstanding task for cleaning up the Devon DE instance of current.
So again, good progress there. But he's thinking about the clarity that we need to prioritize features, and that's clear to him. We're tackling the help chat, and Beth will be pulling in probably the Google Analytics tracking as well. He'll tackle those smaller tickets for us. He and Jiffco will tackle between those smaller tickets while Jeremy Antonio lands focus.
Just like closing out the integration, there are some smaller items that we're completing along the way, for example... Jiffco has completed the minor checkout change bug fix that we had. We'll tackle those as they come in.
But his priorities around one item, one feature specifically, are coupon. So he anticipates having a PR for that today. Good conversation yesterday. Did some work after that conversation and expects to have a PR for us today for Elvis. He's been working on some improvement items. He'll demo some of them for us today as well. One item that I did flag as a concern for him was this idea of duplication.
I think the conversation on Wednesday... He felt that this was maybe invalidated, might just challenge him a bit to... We need to come to a resolution. Even if it's just abandoned. Sending this account ID we just need to come to a resolution today.
He's clear on that. So I expect to have clarity if this can be on block or not. But he'll just take us through some improvement items, specifically with the CIC process. I know he's working on something outside the scope of Mandalor. He's aware that he still has some commitments relative to Mandalor.
So he's going to take it if you can prioritize closing out those tickets more just procedurally again. But he does have a few things that are relative to checkout flow one item on its plate. Beth, I just want to make sure you don't... We don't lose track of this. We do have that session on Monday for us to do that deep dive, walk through, and clean these smaller items. These smaller items are just styling nuances between the original MVP flow and what we currently have.
So we'll address those come Monday. As far as you are concerned of what these individual items are, I have shared those back with the team. There are about four tickets that were five tickets that were created. I'm getting those refined today.
If there are any implications or sizable concerns, I will flag that in this chat for this meeting. If there's something critical, I'll send it to you directly. But I anticipate those are just minor things that we need to address.
That's the only concerning thing I see right now with us projecting out to be able to push Waters directly into C Star by latest midweek next week. I'm going to give Jeremy full credit here. He's made great progress on this. He's able to push orders already in his PR. He's just having some bugs that he's working through on specific contract stuff.
So that's actually really good progress. All right, let me leave it here and ask if there are any questions or concerns I can talk through.

**Jennifer | 15:39**
So far, so good. As far as the tasks and everything, are they...? Because I know that there are still a couple more on the board. Are those going to be something that we turn back to once we get the recurring MVP out? Or is the plan with those?

**Wesley Donaldson | 16:00**
Sorry. So say that one more time. Or the feature specific task from Beth, like the for.

**Jennifer | 16:04**
No, sorry.
Like the alerting and the.

**Wesley Donaldson | 16:08**
So we're not dropping that.

**Jennifer | 16:09**
We have parking lots, yeah, or parking parked even.

**Wesley Donaldson | 16:12**
We're not yet totally understanding. So most of these that are parked, if you look, these are just defect tickets. The one here I already mentioned.
I've asked you all this the priority that this is just blocked from IT folks. The last I connected them with Francis and so Roger... I forget the gentleman's name. They were still working through a solution to solve for this, and it was a lower priority in their queue, but they were aware that it's on their radar. They were supposed to have a solution this week, but full transparency...
It's not a blocker, and the recurring stuff is our priority right now, so this will be tackled once we close out... I expect in our meeting on Monday. Giving you all this love he deserves. He has a good eye for little items like that are discrepancies visually.
So I expect we'll tackle all of these and close them out on Monday so these are not being dropped. I think it's a better way. I describe that there is a plan for solving for them the items that are in review that are more SR track none of those block recurring.
But I mean... How has been able to make good progress on those? He's not blocking the recurring larger effort because he's tackling feature-specific tasks as well.

**Jennifer | 17:27**
Yeah, sorry, I should have been more clear. I was more talking about the ones that are still in the to-do that we've talked about doing. There are some alerts that are still outstanding, I think for the vent bus or something like that.
So, just looking into those. I don't know where they fit on your list, if they're going to be looked into after the recurring effort, or if they're during it.

**Wesley Donaldson | 17:55**
They're after the recurring effort. I mean, the team priority is just getting the order out. This column is sorted. It looks a little messy now when we look at everybody, but if we go by team member, it is sorted through priorities.
Much of the event-specific items were actually on my... So these are originally from what was it? 06:04. Those are lower priorities. So they are reflected in their lower priority, but we will tackle them as soon as we get through. I anticipate this is a small task, as well as the Google Tag Manager, a small task.
That's the next one I'm planning for me. How so? I anticipate I'll get to these probably towards the tail end of next week. The one that I think team members should be concerned about is this guy here. We have already a PR open for it. This was just transparency and observability, just making sure that we actually have alerts in place for some of the queries that were not tracked previously.
So this already has a review out for it. This is the critical one in my mind that falls into the bucket you just mentioned.

**Jennifer | 18:58**
Perfect. Thank you.

**Stace | 18:59**
Okay, that's a good update. Yeah. I think we definitely need visibility, especially where those keys are going to overlap on commerce as well.

**Wesley Donaldson | 19:10**
Exactly. I there's really I mean, there's some two additional tasks relative to this idea of observability in the processing flow.

**Sam Hatoum | 19:10**
Dr.

**Wesley Donaldson | 19:18**
But as a bigger conversation, we're having the first one today with Christian that's around how we're supporting BI for the transparency they need.
So there's a meeting on the calendar. Apologies to... I'm not sure if your part... Jennifer, I know you... I think you and Beth are... So the goal for that meeting, which is I think in about an hour and a half or so... The goal for that meeting is to get just what specifically the projection is that we need to be building out to support... X number of orders and why minutes something to that effect.
We don't know what those requirements are, but that's our goal is to...

**Stace | 19:50**
But again, all those calculations would be done in BI. We wouldn't do that in the projection.

**Wesley Donaldson | 19:55**
Exactly. Just the raw...

**Stace | 19:56**
Yeah.

**Wesley Donaldson | 19:57**
Being able to hand that over to them, I think my worry is, do they have all the raw data they need?

**Stace | 20:02**
Okay. Is Yogis part of that meeting?

**Wesley Donaldson | 20:08**
Give me one second. I'll tell you right now. I usually put them as optional in those types of meetings. Let's see... Mandalor... BI support actually... He's required, so I'm... You're Elvis JFFCO, Beth Christian, Antonio... Yeah, apologies Jennifer, I did not include you. I can add you to that list. Just a minimum so you can at least have the transparent recording.

**Stace | 20:37**
Thank you, Wes. Can you add me as well?

**Wesley Donaldson | 20:40**
Jennifer, okay.

**Speaker 5 | 20:46**
Just for the...

**Jennifer | 20:46**
I don't know if I'll be able to attend or not.

**Sam Hatoum | 20:48**
I'd like to at least have access to the recording.

**Wesley Donaldson | 20:50**
Yeah, sounds good.

**Sam Hatoum | 20:51**
Thank you. Okay.

**Stace | 20:55**
Well, my update might change that, meaning a little bit. Well, I think you guys should still have it, because what Christian thinks he needs will be important. How he gets it might be pivoting a little bit.

**Wesley Donaldson | 21:09**
Four.

**Stace | 21:12**
So... Is that it for the team updates?

**Wesley Donaldson | 21:15**
That's it. For me. Yes, t.

**Stace | 21:17**
Yeah. Okay, I wanted to talk about... I'm going to pull back up our state integration diagram of where we're at. So I think with commerce, I'm going to be careful to frame this in terms of at the moment, it's only commerce.
I think we're at an inflection point where we need to realistically look at a potential pivot and our architecture. Sam didn't join this today, but Wesley, we had some discussions a few weeks ago about this, but what I was really... I'm still concerned that our event model and current is too difficult, too brittle, and taking almost exponentially longer to develop than if we had a slightly simpler architecture.
So we're backed into the corner on a time frame, and I have to make a decision of whether we stay really forward-looking and think of all the possibilities a full event system could unlock in the future and balance that with the future. It doesn't matter if I can't move the company faster today.
So what I'm thinking about the change that we would put into place today, Wesley, is on current forward, right? We may just be writing all the commerce data from recursively directly to PostgreSQL and then using events to read it out of PostgreSQL.
So where we are in this diagram, like this section that you talked about, nothing changes. Everything here is extremely important. The rate items you called out that need to be solved still need to be solved, right? We're going to do all this for the team. What would really happen is everything stays the same until you get into the screen current box, and that just essentially becomes PostgreSQL. I had hoped in yesterday's architecture meeting... We would have seen what's still red here built out. For three weeks we've been working on this semi-pattern. What we really got was a pseudo example of what a shopping cart might look like.
What I really needed was this all-green today. You all this has it all-green in a post-gress architecture today, right? Which gives me confidence by Monday we could have that really productionalized.
Then the only thing we have to do is finalize this section up here. Again, this architecture doesn't change. You're not getting this from a current connector anymore, right? You're getting this from an SQS, but moving the data you know, through the Lambda into event grid, inserting into CTAR and I think simultaneously. Then we can wire up the webhook event from the subscription web subscription updated webhook to get the status and... I think conceivably then stepping away from trying to figure all this stuff out which is still unproven, we've yet to see anything work... Team out a whole lot of questions yesterday in the architecture session. I'm feeling really confident that everything going into productionalizing the store, finalizing all those small tickets as well as building out the data flow, testing it...
To CTAR that could put us back on track to really being able to release this. Go through... Release this to the public. First week of April where I don't have much confidence in being able to do that.
The current model with a KI guess supposedly with the sea. Does that make sense to everyone?

**Wesley Donaldson | 25:33**
One question I had. You mentioned everything after current, is it? So if you go back to the left a little, the hydrated events that we have right here from the ACL hydration, those events are the events we built out there. Would push them into both current and post-gress or come...

**Stace | 25:52**
I think at the moment. Just post-gress. I didn't see enough progress yesterday to think that it's ready, right? So you just beat through an ORM and you post-gress table to admit an event. This would pick up new participant events or subscription updated events and be able to do a thing to see Star and then a read model.
Well, you don't have to reject the read model, right? You just read right back out of Post-gress.

**Wesley Donaldson | 26:26**
So right where your mouse is the existing projections. So the current state, the current system that services all the other functional needs would that remain the same and effectively just post-gress is servicing the recurring order needs?

**Stace | 26:41**
Yeah, so what this... When I say we're pausing on event sourcing now, that doesn't mean we're tearing current out of the architecture. We're not refactoring what is working with event sourcing today.
So where we are using projections and where we are already projecting into our post-gress Aurora instance, that stays where it's at, right? But what we're pivoting to is instead of writing into current using the connectors, doing projections for future order state, we'll just stick with SGL.

**Wesley Donaldson | 27:19**
I stood. Do you have a...? So you... I think you mentioned that's already available.

**Stace | 27:32**
Yes, we have it in a branch and will be merging it likely today. Jennifer, I set up some time for you all of us to go over what's left to fully productionalize that and how that may change or need some refining of tech stories that are already in to-do columns.

**Wesley Donaldson | 27:59**
Okay, sounds like that pivot is final.

**Stace | 28:00**
Two.

**Wesley Donaldson | 28:02**
I think my question then is... I just have additional ticketing to update like the hydration layer. Update the existing connector, which is being worked on right now.
Okay. Understood?

**Jennifer | 28:25**
I had a couple of topics as well. If we're good with that one. So we have good news. A new engineer is going to be joining us next Wednesday. His name is Willie, and he accepted our offer, and he has a quick start date of next Wednesday. I'm out on Monday and Tuesday, so I think that's why it's Wednesday. Or it just worked out either way.
So I'll be introducing him to everyone then. His name's Willie, and he comes from his background as a C vs. Where he's actually done a lot of the business cases that we are actually looking to do already.
So with CBS helps. It's exciting to have someone with a little bit of background in it. Yeah. Then I wanted to look at your next week's timeline and just make sure we've got the priorities between all of the production issues and then the other epics.
So let me pull that up. Sorry.
Okay, I'll do it in the timeline view because that's how we've been doing stuff. So actually, I'm going to go to the backlog, and it's a little bit easier to see all of it together here.
So in here. We've got the MMA membership stuff up at the top. There's the screaming date missing. This one's new. I feel like I haven't seen this one, but there's these bugs here and then these legacy issues here, and I come all the way down to... Okay, so this is status management, the stuff that Harry's still working on.
Then we get down to... I don't even think... Yeah, we... These other ones haven't even gotten off this board. So where do we want to fit in the work for displaying all diagnostics and the multiple screenings within this list of production issues?

**Speaker 5 | 31:39**
Some of the production issues should be P1, and they should be prerequisites to the two epics. So the one that's new was the one that we talked about yesterday that we found the screening date still missing on both the participant and admin portal. We kind of need that in order for us to complete the multiple screening ATPIC so that the 08:28 bug, the new bug, should... In terms of dependency, that's still needed before we move on to APIC but for the rest of the production issues...

**Jennifer | 32:21**
Sorry, so it's missing and that's going to prevent us from multiple screening. We don't have it at all, Harry.

**harry.dennen@llsa.com | 32:30**
So again, which one?

**Jennifer | 32:31**
The screening date? I didn't... I don't think I heard about this. Son, we don't have that.

**Speaker 5 | 32:38**
We talked about it yesterday. From at which meeting we found out that we thought it was on the portal. Only then we looked into participant with the like the user that you provided on production. Then I find out, you know, it was just not showing up all across.
So we thought the fix went in at one point. If, you know, if the fix, we never went in. That's fine. We just need to add the data back now that we are not using the. W what? What's the name of that? The Univ. Universal Time.
Right? That UTTC. Yeah, UTC that should be, the time zone conversion should be fixed, so we should at least display the date because. Yeah.

**harry.dennen@llsa.com | 33:30**
This looks like a regression as it definitely used to be there.

**Speaker 5 | 33:34**
Yeah, so we need the date because when we get to multiple screening, we need to short date and time.

**harry.dennen@llsa.com | 33:42**
So when?

**Stace | 33:43**
Okay.

**harry.dennen@llsa.com | 33:44**
Yeah, I'll have to look into when this regression happened.

**Speaker 5 | 33:46**
So I just found out we just found out yesterday. No, we just built into production and, for both participant and I mean, Bo yesterday. And that's why we started this ticket. But, to Jennifer's point, some of the production issues would be prerequisites to those two new epics. Then, of course, we need to get those production issues fixed first. For others, it depends on the severity. We can... I can update...
If it's P2 versus P1, I don't think it's any P3. So, I think we have a parallel track to have some of the end-of-team members do the two new epics versus...

**Wesley Donaldson | 34:24**
Nothing.

**Speaker 5 | 34:32**
I think we have some resources and end-of-team that can pick up support tickets.
So that's how we should proceed just like we hadn't planned before.

**Jennifer | 34:47**
Okay. Because like the resources that we have picking up the that we usually have picking up the production support are picking up epics currently, so that's why we're spread a little thin.

**Speaker 5 | 35:05**
Yeah, I think we are loin this one specifically.

**Jennifer | 35:08**
This one's P one.

**harry.dennen@llsa.com | 35:11**
I can direct Nick back to this kind of support so I know Furman's doing it. He's got one break fix. If we need these to go quickly, this is front-end. Nick's familiar with this, so he can go on into that. Gay and I will be free to focus on epics.
So if we cannot have interactions and build, then we should be okay.

**Speaker 5 | 35:44**
Yup. I just moved to a 28 to P1, just so that we can keep track of it. Yeah, and then DJ should be out of some of the epics again.

**harry.dennen@llsa.com | 35:56**
He'll be. He'll be on call. And Askco. So. Yeah, he's gonna he's booked up for the next few days at least.

**Speaker 5 | 36:02**
Yep. Yeah, once he's out of the... He should be good to go.

**Jennifer | 36:08**
I forgot I have this view that shows in progress next to ready for the to-do items. But yeah, so this is everything that's in progress right now in blue with everyone working on that. Me... That's fine. How do you feel about making it look better?
So then, as we... The next thing that we would be ready to pick up... I guess this doesn't show those other ones on top because ready for... I guess. And, yeah, so then we've got the screening date missing. Iterable events have incorrect metadata. We had that marked ASAP 1 because Doug is really concerned about the data on Ital, so you guys can let me know if you want to bring that down in priority.
But that's why it was up. So if we mark any of these priorities, then we'll work on those. Anything that's marked as P1 we'll work on before epics, and anything not marked as P1 will work on after the epics. Does that sound good?

**Speaker 5 | 37:28**
Okay, let me see here. The only thing I want to call out is the... But let me see, it's the last four on the screen right now those are epics, right? Is there a sub-test on the epic?

**Jennifer | 37:46**
Yes, yeah, so we... Sorry.

**Speaker 5 | 37:49**
Yep, no, you don't have to move anything. I'm just finding out what issue for this... But I think in general, yes, and unless it's a P1, we shouldn't prioritize production issues over epics.

**Jennifer | 38:04**
That's okay. These three have been sitting there for a little bit. If you can check into the Patty Johnson one and see the importance of it. I do think that this one and this one does need an P1.

**Speaker 5 | 38:19**
Those two. Yeah, I think the... So the first and the third one that you mentioned, I think it came straight from result processing. If they are waiting for screening to be processed, they should be P1, I think you've been talking to Stephanie or somebody else directly on that one.
So I agree. You should repeat one, and the second one, Paddy Johnson. Let me see if they provide paper results.

**Wesley Donaldson | 38:42**
Yeah. Yeah.

**Speaker 5 | 38:44**
If they did, then they can... Unless the call center wants it, they can remain in P2.

**Jennifer | 38:52**
Okay, that's good. Some of the things just for... States to know, like the things that are sitting out there under the current epics are like, "Okay, so we talked about doing that dependency upgrade and review and remediation, looking and seeing what libraries need to be updated." I have that first as the next thing because we want to get this started. Shopify participant information. Only one of the fields is coming from billing now, and then the rest are coming from customers.
So that needs to be fixed because it's very likely to cause a mismatch of information. If it does start having an issue, it might turn into a P1, but that's only... I think if that's... If you guys turn back on the marketing endpoint, I think there would plug in.
I think this needs to be done before that can happen. So let me know what the plan is for that.

**bethany.duffy@llsa.com | 40:07**
Okay. So right now we're just copying the last name over, we're not using all billing info.

**Jennifer | 40:12**
Correct.

**bethany.duffy@llsa.com | 40:15**
Okay, I think it's still off. I'll just verify with Doug.

**Jennifer | 40:21**
Okay, thanks.

**Stace | 40:23**
So is it the marketing plugin that made some fields not available?

**bethany.duffy@llsa.com | 40:28**
Yeah. So they introduced a pop-up like a lead form. Well, they didn't know because it was just like a homegrown third-party marketplace app inside of the Shopify marketplace. Well, it's actually creating a customer account upfront when they're filling out that form, and then the customer account is getting created with the minimal information and attached during checkout.
Checkout isn't updating it because if Shopify doesn't have customer information, it populates it with the billing information.

**Wesley Donaldson | 40:55**
Very good.

**Jennifer | 41:02**
So I just. So I think our requirements originally were to populate it with billing information but I'm assuming that what happened was customer information did fill in the billing information and so therefore the system worked and so we moved on.
So it's a mixture between the marketing plugin and us with some debt.

**Stace | 41:27**
Yeah, that's helpful. I don't want to realize. I was wondering if the fix should actually be a look one place, like an FL kind of thing.

**Jennifer | 41:35**
Yeah, but then when we fixed it, we only fixed one field. Yeah, okay, that's not...

**Stace | 41:43**
Yeah. I don't want to turn into anything than it needs to be because hopefully we're launching regularly in a week or two.

**Jennifer | 41:51**
Yeah. Yes, and that's why I put it further on the list because hopefully we'll be able to get off of it but just in case it's there. This one here with the migration of my community to LLM is actually migrating off of Amo or the first user pool, migrating all those users out and removing that user goal so that's where this is standing. Which is why I don't see it happening in the next couple of weeks based on where it is in this list, we have... Pugnito create user is failing a ton when the first name is missing. This might be something that we talk about being a higher priority because this could be a reason that Paul Center is not able to get people to log in because their accounts aren't getting created because the first name's missing.
I see OS... Yeah, I see a lot of those, but I don't know the dates.

**Stace | 42:57**
We just weren't careful on what fields are optional versus required, right? Cognito doesn't technically need the first name, does it?

**Jennifer | 43:05**
No, and that's what I put in this ticket. Is that we shouldn't require anything except participant ID? That's the only thing we should be requiring for our cognitive account. Yeah, because we can even create one without email, without phone, and let it sit there. There's a bunch of parked events I put. I had listed here Cognito.
But there's actually a ton of parked events that can probably be deleted from a lot of the buckets, so this is the one. Like this one here requires a little bit of handling because we may need to replace some of the events. Some of the other ones just need to be purged, or at least most of the events.
So that's something that needs to happen. Right now, if you delete an email address, I didn't test phone, but if you delete an email address in Krisp, it is deleting on Cognito, which is causing some issues with customer service because they are not able to fix certain things like you. They have to...
I have to guide them to adding a bad email address in order to fix issues. I'd rather that not be the guidance because when we first brought that up, they were very worried because they've told their call center agents not to do that specifically.
So opening that door would open other things. Let's see here. Then I think everything.

**Stace | 44:48**
We start a torpedo change, solve as much as we can with process, and do whatever minimal fixes are necessary, right? Because the real goal here that makes it so much easier to power through getting call center sales out of Krisp in the next four weeks.

**Jennifer | 45:11**
Yeah. And these and it's a...

**Stace | 45:12**
First point thing. Then we could even introduce... Right? We own a new data model. We could say your log email could be different than your notification email.

**Jennifer | 45:26**
This one here. And like this one might get taken care of with BAS updates. I'm not sure, so I'll check again after he pushes his stuff in. I just wanted to bring those to your attention. And why, when you hear that they're still here in a couple of weeks, why?
Because there's just other things above them. Okay.

**Stace | 45:52**
Maybe we can talk about one of our meetings. An interesting side note is Willie, who Jennifer said we're bringing on next week, has worked pretty extensively in a consumer-facing product that was used Cognito. Not that he had a whole lot of love for the system, but he did talk pretty extensively in my interview about how he learned to work around it to get it to work well.
So there will be someone with a perspective of having used it before on the team. So these might be our stories. Yeah.

**harry.dennen@llsa.com | 46:36**
Very key to chat.

**Jennifer | 46:38**
That's a great idea. I've got tons of beginner stories for him then. Good call out.

**Sam Hatoum | 46:48**
Sorry, I'm just catching up to the conversation here. Do you want to spend a tiny bit of time at the end with me just to...

**Stace | 46:55**
Let's do that. Jennifer, are you done with your more

**Jennifer | 46:58**
Tickets to go? I was actually going to bring this up for you. Okay? I have been mentioning multiple times that I've been tracking the delays. I went back through the tickets and looked at any of the tickets that aren't fully on a specific task or if there are defects on something, for example, the recurring task on that feature.
If it's not on that feature, I put it on this list. I tried to do the best I could with estimating engineer days based on the history of each of the tickets. So I tried to get it... It's very difficult to be accurate with that.
But I looked at the people and made sure that I wasn't overlapping them where they had ten days and five days or something. But so I'm pretty... I'm 80% confident that this list is correct.
Maybe more than 90%. I spent a lot of time to make sure that they're the right numbers, but I categorized everything into these delay categories, and let me just make sure it is up to date. Yes.
Okay, so some of the ones that are causing us to have those errors with the connectors on the data because it affects all the connectors and everything that I put in event source complexity. The PC work that Antonio did...
So... You hadn't seen this column. I had it under production bug before I think, but now I split it out. We have production bugs. This is anything that's not legacy production issues that we are taking care of that aren't categorized into event source, blue-green, or PR environment. We have blue-green, we have PR environment issues. Missed requirements are separated from production bugs. When it's something that we should... It was clear in the requirements that we should have done XY and Z and we didn't. Whereas production bug is like something that pops up as a side effect of our change.
So that's how I split those out. I won't go through the rest of the ROS. That's time that would be spent triaging issues or working on issues that are because of manual errors on other processes that are outside of apdev.
But it requires an engineer to fix skill investment was the time that we went into playwright. I didn't put Claude because I felt like that actually increased speed rather than delaying it. So, just there was some time spent getting up to speed with playwright for the team.
We'll actually have to do that on an endor as well soon.

**Sam Hatoum | 50:18**
Yes, show me how you went into categorizing things as open sourcing complexity. So I understand that. PA.

**Jennifer | 50:24**
Yes, I will. If you want to talk to me about any of them, I am willing to go through it. So here are all the ones that I put as event source complexity. The reason it was so high wasn't because of the number of issues, it was because of the amount of time and the amount of people it took to take care of any of the issues that came out of events source.

**Sam Hatoum | 50:59**
I can take a screensho one and then you guys can carry on you so.

**Jennifer | 51:03**
I can share this with you.

**Sam Hatoum | 51:04**
Well, that'y thank you.

**Stace | 51:07**
Yeah, I think that would be good.

**Jennifer | 51:10**
I thought I shared it with this team before, but I don't know what happened because I don't see it on there. But you guys can take a look. I don't want to bring up anything that you have questions about.

**Stace | 51:26**
If you go back to that chart real quick.

**Jennifer | 51:30**
Let me... To this because I don't know if it might not affect it.

**Stace | 51:34**
Yeah, no, I think this is a really interesting thing for us to talk about each week because narrowing each of these down... We've seen some big gains in velocity already, I think in this calendar year.
But clearly, this points out there's some stuff we should do. Specific... Sam is leading into one of my decisions now, right? I look at the top two as being really complementary to each other.
I think it is the event source complexity that has led to almost all of the production bugs we've had to solve, which are the two biggest things holding us back, followed by the next two things, which were really our focus.
December and January were pipeline issues. I'd really hope this won't still be bubbling up with so many people giving feedback that's what's delaying them. So I think that's something we have to keep an eye on.
But I think I'm glad Jennifer put this together. I think it's a good thing for us to look at every Friday, and open to feedback on this too from a product perspective as you're watching things go through or not go through, what might be contributing to that?
How can we improve?

**Sam Hatoum | 53:10**
Yeah. Definitely a good idea to always analyze what we're doing. One thing I just want to highlight with regards to when we say eventful and complexity, looking at something like results broken or something like that, things not being sent, I just want to highlight the alternative of what happened otherwise the system might have the history of what happened. The replay and going back and fixing things is certainly not rosy.
When you have the events, you're able to go back and fix things. That's part of what takes the time is to go, something happened. Now we can go back and fix it. I'm not saying it's all of them, but I'm saying as a significant number has been able to go, "This didn't happen since January." Shoot, let's go to January and fix it from January onwards. How would you like to do this business?
That's something we do. I think the alternative is not that rosy. That's why people... That's why we end up doing things like this. So people do forget how painful it can be without it.
I just want to highlight that just because those are bugs here that look like they're under event sourcing, if you didn't have event sourcing, I'd be interested in analyzing even just an estimate. What do we think that problem would have looked like if we didn't have events forcing?

**Jennifer | 54:23**
I can go through and separate out time that we took to replay of events, and that could really show the difference because I included that time in either blue-green or event source. But if I separate that out, it'll show that because the replaying the events is faster than some of the other stuff.
So maybe it will show that there's a little bit of benefit from that.

**Sam Hatoum | 54:53**
Like if you've done something wrong. Exactly a few months ago. And you need to repair that. You just you have.

**Speaker 5 | 54:58**
The data like...

**Sam Hatoum | 54:59**
That's simply what I'm trying to say. And we've used that multiple times. It's happened multiple times. We've been able to go back and fix stuff. So it's not like event sourcing has just been killing us.
It's been helping a lot in these cases. And so just want to highlight that. And yes, let's please differentiate that over here. I'm interested in just like what the impact is at the end of the day's stays.
Like, I want us to do the absolute most right thing for LS and for you and the team. So let's talk about that. But I just want to be sure we're making the right decision if it's finally decided. No problem.
Like, I'll, you know, we're in, I mean, with you, we'll help you out and get you there, but I just want to make sure, like, the, you know, it's. I'm understanding the reason behind it and why. And if that's okay.

**Stace | 55:45**
Yeah, we can talk. I guess you want to check out the app and the demos that are coming up right after this. But I'll see what you're free for. But that does mean that any decision that's made for now is nothing's carved in stone forever.
So that was one note that popped into my head for you, Wesley. For the stuff that's in flight with Antonio, if there needs to be a little time or investigation, I know. I was just looking at earlier some of the notes from the architecture session yesterday where he said some things were already checked in with the pattern is my rambling answer to say, "Let's make sure if there's a branch or something that we've been working out of or what's been done so far, right?" We can check that in... Way to save it.
I don't mean... I'm not suggesting we'd throw everything away and forget it all happened. I want to go leverage what we've done so far, even if it's not what we're going to do for this particular domain of the application.

**Sam Hatoum | 56:50**
Yeah, let me check with you just one thing. Today, I'm out from 10:45. I've got a procedure, and I'm going under general anesthesia, so I won't be around for the day, but I'm available for the next hour, if that's valuable.
Okay. Yeah, we're just... We just literally got everything into production in terms of ET and the framework and everything. I think it's... Center... Maybe it's an opportunity here to... Yeah, do you have any time in the next hours?
Because I know you're trying to decide...

**Stace | 57:26**
Yeah, give me at least 30 minutes if I can catch the beginning of the demos. We're about to do, and then I'll message.

**Sam Hatoum | 57:32**
It sounds good.

**Stace | 57:33**
Thank you. Okay.

**Jennifer | 57:35**
Is there specific demos that you want to go first?

**Stace | 57:42**
Probably anything you want to... Recurly or Mandalor first.

**Jennifer | 57:48**
Perfect, and then we'll do yours next. Harry. After Harry... Thank you. So, you guys on the next one?

