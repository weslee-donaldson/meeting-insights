# Mandalore DSU - Mar, 11

# Transcript
**Wesley Donaldson | 01:33**
Test, can you guys hear me?

**Michal Kawka | 01:36**
Yes.

**Wesley Donaldson | 01:37**
Okay, cool. Okay well let's get started, shall we? Ask me how here. Yes, he is all right. Me how? You have a few p ones on your plate. So let's start with you.

**Michal Kawka | 01:56**
Sure thing. 
Good morning. Tim so I'll start from right to left in terms of the parked events alerting. It was merged yesterday. Thank you for the revuls. I double checked on prod and the dashboards look good, so we do see the parked events. We have diagrams, we have split by the bucket. 
So it's looking good in terms of things that are in progress. The first one is a blue green Lex Switch event resolution fund for Endor. So I'm currently running a drive run of the events that are supposed to be replayed. We discussed with Jennifer yesterday which ones are safe to replay. We discussed on the group. 
So basically based on error method and based on event type. I'm currently running the script, as I said, in dry mode because I had to make a few tweaks, and I'm making sure that nothing that's supposed to be deleted will be deleted after the stand up. I should be able to run the real script without the dry run and basically replay the events. I thought it would take a few hours, but from what I can see now, it's gonna be pretty quick because we only have like thousand or two thousand events that we will be replaced because the vast majority of the ones that are parked are not supposed to be replayed right now because they're missing either email or first name. 
So we'll need to figure it out as a follow up. And in the meantime, I'm working on the unmonitored dead letter cues. So when analyzing that TP at 66o, I believe I noticed that we are missing alarms for some dead ledder cues, so only a few of them are monitored. 
So based on the current code base and the infrastructure, I'm going to add alerts for the missing the letter queues to give us more visibility in what's going on. Because today we notice that there's 30 parked events in the Shoopify legacy. That letter Q so we resolved that. I already talked to Harry and Jennifer about that, so they're going to analyze and decide if those can be purged or replayed.

**Wesley Donaldson | 04:17**
Yeah. Can you just speak a little to this? Ticket please.

**Michal Kawka | 04:21**
Short thing. 
Yeah. So I opened atpr yesterday. It's. The document is in form of a Markdown file, so it was already reviewed by Wes. We asked, I believe, Jeremy to take a look. So if it looks good, we're gonna merge this document and it's gonna, serve as our playbook for future alerttings. 
So we're gonna have rotations, most likely of developers who are supposed to look at the alerts on a daily basis and on a weekly basis. So this is going to serve as our playbook. And as part of this document, I identified a few gaps in our observability. 
So once they are resolved, the document is going to be updated, of course, so that we are in a state which is up to date.

**Wesley Donaldson | 05:11**
Cool. Okay, thank you so much. Let's keep going. Antonio.

**Antônio Falcão Jr | 05:21**
Okay, guys. Yeah, uhing the in review one. I have, a definition from SAMS. So I started working on this right away in the implementation and regarding the 714 in progress, I have this code on, but I don't want to bring this to review because it's gonna trigger the pipeline and the deploy. 
So I need to address the DNS chains first to avoid any downtime. So I have a ticket with DE VB so I will talk with and your team today, see if they can prioritize that for me. And once it's okay, I can just move it to review, which will trigger the first deploy as well. That makes sense.

**Wesley Donaldson | 06:12**
My concern here is just make sure we coordinate with because it's going to change. Do you I suppose, change the URLS for temp and just may impact other team members when we make this switch. 
So a bit of just coordination or your plan of attack of how we're actually going to push it live?

**Antônio Falcão Jr | 06:28**
Yeah. The way to avoid this downtime is by, devot team finishing the DNS set at first. Then I'm good to open a PR.

**Wesley Donaldson | 06:39**
Okay, you've opened a ticket or you already have a ticket open?

**Antônio Falcão Jr | 06:40**
The PR will trigger the deploy and then we're gonna be okay. Yeah.

**Wesley Donaldson | 06:46**
Are you working with Daniel? Are you working with Francis? Who's who are you partnering with?

**Antônio Falcão Jr | 06:51**
I asked for Jennifer to open a ticket for me. I reached out her. Just to get the number and ask them to prioritize it.

**Wesley Donaldson | 07:01**
I think my concern for this is and maybe you can just summarize it for maybe myself and Jennifer, just like how this is impacted by the conversation we had yesterday in architecture. 
So if you can just maybe paint me on the side for that. Please. Just keep going chir me over to you.

**Speaker 4 | 07:24**
Morning 6807. The bottom one of those two tickets is just got merged. And then my in progress one I plan on finishing up today. I just need to add, playwright tests for.

**Wesley Donaldson | 07:46**
Okay? Yeah, and there's an AI skill in the repo for that. If you could try to see if we can make this be more of a Claude task as opposed to a germy task. You know what I mean? Germy managing Glo. Take give me and maybe pick me offline. Give me an e on this one too, please. I'm trying to get you to jump on some more products, but feature specific users specific functionality. 
So if you can please join product office hours today, there's three tickets, three epics I'd like to run by you. You're probably gonna own at least two of those. So give me an E on this. Let's see how we can prioritize to get you working on one of those epics tomorrow. The latest. Keep going. JFF go over you.

**Speaker 5 | 08:32**
Good morning. Happy holiday. So on my tickets, I completed, both implementations with the visual changes, multiple small items on the appointment packages, review and checkout pages. The first one, the PR, was up yesterday and this morning. Thank you, Jeremy, for providing me this recurry. Items, conft keys. 
So I was able to complete that other one, and the PR is up for it as wellw that 713 is the second one. Don. 713. There was actually a note given if you were here. The item number 6. When I looked at the Figma design it does not match exactly with what you're saying. 
But still what we have implemented didn't not match Figma either. So I aligned to the Figma right now. Left a note there if you guys feel it needs to be different, please me know happy to update it. Yes. 
So then with these two PRs up, please anyone give me a hand whenever you can review and if any issues, happy to update if not ready to merge. After that I started on my next ticket, the recovery ingestion CDK I'm resuming right now. 
I think I already have a couple of questions. I'll be posting them soon in pinging you guys to clarify, but hopefully we should be able to start implementation on that later today.

**Wesley Donaldson | 10:03**
Perfect.

**Speaker 5 | 10:04**
No impairments at this time other than the forementioned thank you.

**Wesley Donaldson | 10:08**
Yep. And, Figma is the source of truth there, so just focus on what the latest on Figma plan.

**Speaker 5 | 10:15**
Okay, that's what I did.

**Wesley Donaldson | 10:15**
So perfect sizeland scilar.

**Speaker 5 | 10:16**
That's what I thought. Yes, thank you.

**jeremy.campeau@llsa.com | 10:28**
Yeah, there's an item in review. There's a V map, there's a PR open that one so I can did a review back guy and then I have two items in to do. The one item looks like a test, sort of a validation item. 
So I don't know if that's just the tail end. Make sure everything is hooked up initially. Looks like seven.

**Wesley Donaldson | 10:59**
733. Let's maybe have you pair with Antonio just to kind of review these.

**jeremy.campeau@llsa.com | 11:01**
Yeah, that is the ticket above that gonna change at all.

**Wesley Donaldson | 11:04**
Apologies. I don't think you've been part of all of the architecture conversations back and forth. 
So it's worth a bit of a review session with Antonio just to talk through them. No. So I would suggest you pick up 07:28 first. That one's pretty solid. There could be more conversation around 07:33. 
You, Elvis. A few on your plate we could talk about, but let's give you your status first.

**Yoelvis | 11:43**
Hey guys, I yesterday I metched the COO yn implementation and refactoring so for. So I added a remi if you want to see how to use it. But the idea is that now we no longer need to create and maintain a graphqer types by yourself, we can just generate them aroomatically. In case we change the schema in the server, we call generate and those types are gonna be generated. 
And for the queries and mutations, you just we just uhh, declare the query and mutation that we need. And Cogen is going to generate a document that we can use in the use query or use mutation, and it's going to include all the types and everything automatically, so we don't need to maintain those types, neither. Other than that, working now on the implementation of the fifteen minute appointment availability on checkout. 
I have something working. I'm doing some testing, but. Yeah, that should be good to go with some.

**Wesley Donaldson | 12:53**
Yeah, this is not a P1, but I would suggest the next one for you to pick up is going to be 749. This is from the conversation yesterday around passing the account ID in checkout to prevent the dupes. To prevent dupes. That should be your next one. The other things in your queue. 
I think most of these are just kind of similar to Codegen. They're more higher level thinking across the entire across the repo. So maybe take a read through. Maybe you and I pair together. See which one you perceive is higher priority, but the actionable one is definitely 7:49. 
And then the others are more about just getting ahead of, structure and confidence within the repon, how we're doing, how we're implementing.

**Yoelvis | 13:35**
Can we move the tickt to the top? Like to have some prior station?

**Wesley Donaldson | 13:40**
I hold on and let's go like that.

**Yoelvis | 13:49**
Yeah, that's helpful.

**Wesley Donaldson | 13:53**
Yeah, no worries. And if I can get you just. In the conversation we're having around what Mehao mentioned, I think that's I'd like to roll out that plan starting next week. 
And you, Jeremy, I'm volunteering you because you volunteered for leading status this week, so you kind of volunteer for that Thank you. Appreciate that. So if you could just take a read through of the document me how created and see if we can start planning getting the team starting rotations next week. 
And if you don't know what I'm talking about, let's talk there. All right? Anyone uncertain of their next task they're working on? Anyone blocked? Anyone have any questions? 
All right, thank you guys so much. Stay in communications over chat and please help out with reviews if you can. If you see something, if you have a couple of minutes your review, always appreciate it, even if someone else has already reviewed it. Thank you so much by for now.

