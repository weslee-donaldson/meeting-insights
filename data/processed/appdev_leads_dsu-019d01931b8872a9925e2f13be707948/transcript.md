# AppDev Leads DSU - Mar, 18

# Transcript
**Speaker 2 | 00:08**
He money gos.

**Wesley Donaldson | 00:09**
Good morning.

**Jennifer | 00:15**
Good morning, Harry's finishing up the end-of-the-week DSCU they had a parking lot about some of the alerts and how to monitor and stuff, so he'll be over in a minute. Les, did we want to get started with you?

**Wesley Donaldson | 00:37**
I'd love to. Maybe pair with Harry on what he's seeing as issues or challenges. Again, actually let me share my screen.
One of the core intentions of this ticket was... And that SRE track was to empower folks to be able to do that kind of on-the-ground monitoring. We may not have everything every dashboard specific to end or... But the playbook that we have is basically it breaks out exactly where you should be going to reports and how you should be interacting with reports.
So it may be valuable to have him take a look through that and have us get to that as a shared document, not just a manual document. I can connect with him on that.

**Stace | 01:24**
I think the spirit of that is important because, again, I think we keep either tripping over the same things or trying to reinvent the wheel when we should just have one standard and playbook that's in place for all the code that we write.

**Wesley Donaldson | 01:38**
Totally agree. Okay, I'll take that for me.

**Jennifer | 01:40**
Yeah, and that's yeah, they're kind of like a little lost. So that playbook is definitely going to be exactly what they're needing right now. I did let them know what I saw in the Mandolor channel that we hell was going to take a look at the alerts so that we didn't duplicate effort.
So I did let them know that, but they were just kind of, trying to figure out the different dashboards and looking into them together. So that playbook will help.

**Wesley Donaldson | 02:08**
Perfect. Yeah, Gico is giving him another pass at reviewing since FFCO took the training yesterday. I think so, but I'll share it with him. Let's keep going.
So for today, things that have been moved, completed... We actually moved the CDK to some of the 1.1 recurrently specific tasks into DUN, most notably the CDK stack task that includes everything from the API gateway for ingestion of the webhook all the way down to some of the DLQS alerts that we have set up. Just based on our basic standards, whenever we implement a Lambda, implement a queue.
So those are done, reviewed, and pushed into main. We moved out some tickets that were just leftovers from the MVP effort. We have two more that we're going to present to product today, but they're known quantities. We had a good session with BET just to walk through them, expecting to close out these two again. Today we did incur some small items from that review, minor things like maybe presentation of the coloring on the footer, some drop shadows, and minor icon changes, but nothing that will block production to production. We're taking them as low priority, which we'll tackle afterwards. We already touched on this assessment ticket, so that's in good standing. You're just getting a little bit more review on it. Whenever we have the next architecture meeting. This is only parked here because we want to actually have a formal presentation. Antonio is implementing these in the design patterns he's using right now. This is mostly most relevant around just the productions. We're already using the ACL from the emit mechanism approach to doing event sourcing.
So these are actively being implemented but holding onto this ticket to actually present it to the larger team. We have some good PRs... I think he pulled it back, but we actually have some of the draft from Lance regarding the webhook processing as well as we have. Antonio has shared a pretty robust PR around the ACL layer, but more importantly, within the ACL the hydration layer.
So if I were to pull us back to discuss grounding space, if you look at this, the coloring out here. We have... Provided the workaround for the CDK. Generally, Antonio has provided the hydration and the ACL, so he's at the point now where he's already proposed to Jeremy how to push events into current and how Jeremy will consume them effectively. We have most of the ingestion pushing into current in that minimum PR. Antonio has taken a passage just if we were to think about these as points of integration, so this is the feature itself. This is the integration.
So Antonio is sticking a pat this morning just proving out all of these as part of the build effort. If code did confirm that he could push a fake event into the system, but Antonio took a more specific task and just tested the full process. As far as the team, I'm not going to go over all the in-process work.
I'll just simply say that the team is tucked in on the recurring specific task. Me how is closing out some work around the SRSE stream of work, and once that's completed, the only thing that's really critical there is just closing out the postmortem and closing out this assessment document. Once that's completed, he's tackling some of the features that BET has provided that are more customer-facing.
For example, the manual coupon entry and the chat integration. So the expectation is we'll have all those UI things. Unless... Whatever the new stuff we spoke about yesterday, the target is to have all the stuff in minimum PR by Monday or Tuesday of next week to give us enough run rate to get feedback cycles through it. One thing that was... That requires some additional follow-up from the team from our conversation. Jennifer, when you connected with Jeremy, and thank you for doing that.
I think there's still some uncertainty there. So coming out of that conversation, it changes some of the assignments and just who's working on what. So I just need to peer with the three gentlemen. Sorry. With you
and Jeremy and LAN. Just to confirm the separation that I currently have in 1.2 sounds like some stuff. There is a bit of an overlap, so I'll clean that up this afternoon, but nothing blocking the team and getting through the core goals of 1.2 getting content into CSTAR. One additional thing for conversation, we... Sam had requested a meeting for us as an opportunity to connect with the team and tackle whatever they the team believes is an urgent issue. Specifically, I had offered up the idea of the mapping as one of the most critical things, which I know Jeremy's actively working on. I'd ask the team for any topics they wanted to bring to that conversation. In lieu of a topic, I've asked Sam to tackle the mapping as the work item.
If there's something you're aware of, maybe Jennifer, you have a perspective. I'd love to hear that and see if we still want to hold that meeting or not. Think that's the... How are you?

**Jennifer | 07:18**
If you're asking me right now, like after talking with Jeremy, like I had talked to him, I think there's going to be less mapping and a little bit more just like tweaking of the API it should be less work than it was.

**Wesley Donaldson | 07:20**
Good.
Nice, that's great to hear.

**Jennifer | 07:35**
So...

**Wesley Donaldson | 07:38**
Well, maybe I'll just ping Jeremy directly and ask him if that topic is still relevant. If he's at 80%, 85%, then
I'll just let Sam know. If I get no topics, we'll cancel it in the next hour or so. Excellent. There are a few things in Paul's or Block that are very much intentional. This one is based on FL the conversation we had yesterday with Ricurly. You all... We just want to rethink the approach based on that information.
This one is intentionally... As I asked to be moved to pause just because of time blocking to free up Jeremy to focus on the ECOM 3 API portion, the mapping. Any questions?

**Jennifer | 08:30**
Yeah, on your guys' effort, do you guys have the work to update membership statuses or is that out of...? Is that something that you guys haven't...?

**Stace | 08:47**
I don't think we've refined any of that yet because we have to get that object into Krisp first, and then we'll have to talk about MMA after.

**Jennifer | 08:56**
Okay? I was just wondering because... I know you were concerned about the timing. So that might be something that we're going to need to talk about sooner than later, especially because the...

**Stace | 09:08**
I'm just thinking of resources, right? In order of importance, right? It doesn't really make sense to update MMA if the orders... Not even in Krisp. So we just have to slog through it.

**bethany.duffy@llsa.com | 09:21**
Are you talking about the renewal job? Yeah.
That should be separate than the order flow, right?

**Stace | 09:37**
Well, the data flows through the same pipe, right? So we got to build that all out first.

**bethany.duffy@llsa.com | 09:43**
Got it? Okay, so time frame for that one? When I chatted with Christian yesterday, it sounds like Worldpay is expecting to get us the tokens back on the 30th. So the earliest we would be importing would be the 31st and potentially running renewals at that point. I don't know how many renewals...
I think it's close to 6000 that were backloged between those two weeks. So we would probably want to figure it out before those 6000 get renewed.

**Jennifer | 10:20**
There is another alternative, and that's like since DJ will have the Azure side, there's it's a possible that we can run scripts manually until we get it working with a web hook.

**bethany.duffy@llsa.com | 10:34**
Got it? As long as there's a way for someone whose membership gets renewed, they call the call center, and needs to be able to schedule them. The only way they can do that...

**Speaker 2 | 10:43**
Is if they're...

**Stace | 10:44**
Worst case scenario, they can just look them up and recurly and see if the charge happened right, or have a recurring or exported report in front of them. So I think there are ways we can get through this.

**bethany.duffy@llsa.com | 10:58**
Okay, we can talk... If their membership isn't in good standing in MMA, then I don't think Krisp lets them schedule anything. That's what I'm concerned about.

**Stace | 11:10**
Okay, yeah, let's... That should come into one of our product sessions. I don't think we're going to work this out in a DSU. The ticket needs to go through the whole process.

**bethany.duffy@llsa.com | 11:21**
Right? That's why I had the tickets created for updating the MMA job.

**Jennifer | 11:27**
Got it?

**bethany.duffy@llsa.com | 11:38**
Okay.

**Jennifer | 11:40**
Thank you. And then Harry. Yeah.

**harry.dennen@llsa.com | 11:51**
Okay, we have some of the main ones. This webhook deal. So two of the issues have been resolved, which is the missing last name we sent to billing last name and then I think we're ignoring the pipeline issues. There's a third one that Nick is working on.
So this is still in progress. Jane's wrapping this up today. We had a conversation about what's actually a redundancy check because we're trying to do less in this one, but we're going to keep everything in this one.
So Frman has made this update. He'll demo this in production off the TOS you can see it, and then the test coverage is still ongoing. Stephan's got a couple of PRs for me to review today. Reviewed yesterday. There's an interesting issue that we need to look into as well around the Apollo library. Q Wave is ready for review today.
Onto the work that we want to get done by mid-next week, DJ has started on one of the two tickets that we're trying to finish by this week, and then I started on the staff management stuff. So a little bit risky as of mid-next week, but if we don't have any live issues, I think we can still get close.
That's everything you completed stuff. So the rerunning the PDFDLQS finished yesterday. It's like 700 messages in there from the no-JS update that broke a library. This is Nick's last name. Fix the Shopify order. Dall-E was trained as well. We still have down from 02:50. We still have 45 events in there dealing with...
Then DJ fixed this. There was a one-off issue around a field not showing up, but it was a database. There isn't an ongoing fix for that. I think as these come up, you'll still just fix them because they're very rare.
Then we have the heart risk assessment display error, that's shipped as well. That's everything.

**Jennifer | 14:17**
Okay, thank you.

**bethany.duffy@llsa.com | 14:21**
I have some questions about the Shopify one. Yeah, because I'm fielding questions from Shopify support. So they reached out to us this morning and said that they're seeing 122 on the proxy order that weren't added from 311 to 317 because the appointment time wasn't available. My first question is, can we validate that with that error show up in the dead letter queue, or is that just getting pushed over to the proxy report and wouldn't show up there?

**Jennifer | 15:03**
I believe anything that's in the proxy report is not going to be in the dead letter queue because those aren't going to be counted as exceptions.

**bethany.duffy@llsa.com | 15:10**
Okay, that makes sense. So for the 122 that didn't have the appointment time available anymore, they're asking if there's anything that we can do to help reduce the manual load that they have. Because in those scenarios, they have to go in either find or create the participant, schedule the appointment, and then do manual adjustments.
That's a lot for 122 orders. So they're wondering if there's anything that we can do, either finding a close time to get them rescheduled or even just creating the participant profiles that don't already exist. I don't know what is feasible with the tools that we already have in place.

**Jennifer | 15:58**
That's interesting. I don't think we have anything that would be able to... Unless we have something legacy that I don't know about, I don't know if we have anything that picks an appointment time. There could be something like... I don't even know how we could modify the script that we've got, because it does the whole process. It doesn't have specific parts that you can just run.

**bethany.duffy@llsa.com | 16:27**
Okay? Or the apply Ma. Is it just like an appointment cell go it that's being passed?

**Jennifer | 16:37**
Yes. So if we get that, we could put them in and then we could run it to just create them.

**bethany.duffy@llsa.com | 16:45**
Okay, so if we found a valid appointment cell guide and put it in a spreadsheet and you guys could rerun it?

**Jennifer | 16:51**
Yeah, we would probably want to do small blocks of them so that they don't get expired again.

**bethany.duffy@llsa.com | 16:57**
Yeah. Okay, let me talk to them and see if there's any way that they can find that kind of data and send it over. When you say small blocks, are we talking maybe do four hours and send it over?

**Jennifer | 17:17**
Yeah. I just don't know. I don't know how quickly these fill up, but I wouldn't want them to go and find all this stuff just for them to have already been taken.

**bethany.duffy@llsa.com | 17:28**
Okay, yeah, that makes sense. Let me chat with them really quickly and see if that's something they think they can do otherwise. Yeah, I don't... I can't think of any other way. Okay.

**Jennifer | 17:48**
We would probably... I needed to talk with Jeremy and see what his script does to see if it pulls off of Shopify or something. Otherwise, we might need to have a very script that puts from a CSB into the format we need for whatever we were using to rerun the D LQ possibly.
I'll look into what work we have to do, but we might have to put something together.

**bethany.duffy@llsa.com | 18:17**
Beth got it. Okay, let me see if they can even get access to any of that information, and then we'll go from there.

**Jennifer | 18:29**
Okay, sounds good.
Anything else from anyone?

**Stace | 18:43**
Nope. I did put in the chat with another complaint that got raised through an executive thread of a participant getting the wrong results. Stephanie's aware of it, but Jim and Matt are expecting an answer on why the...

**Speaker 2 | 19:10**
The complaint said it was via email. Do we know it was via email or paper mail?

**Stace | 19:16**
That I do not know.

**Speaker 2 | 19:19**
Can we have a response processing confirm that? Then we can have engine before we start up a new ticket for development to look at things because if this is from paper mail, then I think the corruption has all the way on the top.

**bethany.duffy@llsa.com | 19:38**
It says by mail, right?

**Stace | 19:43**
So it could be part of the whole exception sheet we've seen.

**Speaker 2 | 19:47**
Yeah, and if it's even... If it's called by email...

**Stace | 19:51**
That finger, yeah.

**Speaker 2 | 19:52**
Even if it's from email, it's still the ID my process today. So which is something we suspected for a while now is there are things that I know we are fixing thrive, but there are things that could be historically in CSTAR that we never really look into.
So that's I think it would be helpful.

**Stace | 20:15**
For us, the ideal is as long as we can rule out thrive and any other continued problems with mixing up Peguids and Cognito and things like that, right?

**Speaker 2 | 20:32**
Okay. Yeah. Less... I is from paper mail. Will via email, but either case should not be for thought.

**Stace | 20:42**
Sounds good. Awesome. Okay, thank you.

**Wesley Donaldson | 20:54**
Thanks. All.

