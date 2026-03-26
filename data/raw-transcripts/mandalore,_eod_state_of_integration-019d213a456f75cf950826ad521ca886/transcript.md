# Mandalore, EOD State of Integration - Mar, 24

# Transcript
**Wesley Donaldson | 00:16**
Good afternoon, gentlemen.

**Antônio Falcão Jr | 00:21**
Good afternoon.

**jeremy.campeau@llsa.com | 00:23**
I can't believe it's 3:00.

**Wesley Donaldson | 00:25**
Seriously. Feel like the day goes by so fast.

**jeremy.campeau@llsa.com | 00:31**
Yes.

**Wesley Donaldson | 00:32**
Jesus. Ask you folks. I really would love Francis to join this.

**jeremy.campeau@llsa.com | 00:40**
Yeah, I was going to say, maybe we can go over it when everyone joins, but it seems like based on what DJ was saying in the chat, we're going to need Francis to do something where he makes sure that the events for the event grid go to the right source or whatever, the right destination or something. I don't know if there needs to be a rule, since it seems like we now have two listeners when the DJ has for membership-specific events and then the one we have for the order being placed.
Yeah, I just wanted to throw it out there.

**Wesley Donaldson | 01:15**
Well, you're only... Are you listening for every event on the grid? Or are you listening for events and then filtering and then only sending an acknowledgement back for the one you care about? Basically, my question is if your code is filtering and not acknowledging whatever is currently on the grid, his should just be following the same pattern and then effectively they wouldn't collide.

**jeremy.campeau@llsa.com | 01:37**
Yeah, that's a good point. Yeah, I'm checking to see that it's the event that I want, but you were saying there's...

**Wesley Donaldson | 01:44**
Exactly.

**jeremy.campeau@llsa.com | 01:47**
Is that just words you use, or is that specific to an event grid, like the filtering versus whatever you said?

**Wesley Donaldson | 01:55**
I'm thinking about it within the context of current connectors, honestly, but like, you're right.

**jeremy.campeau@llsa.com | 02:00**
Okay, because I guess I can double-check, but double-check that to make sure that I'm just... There's a way to check if there's a filtering or listening for certain events and...

**Wesley Donaldson | 02:12**
Okay, no, you're absolutely right.

**jeremy.campeau@llsa.com | 02:15**
I don't know.

**Wesley Donaldson | 02:17**
Like, there's just take a look at the code and see how it's handling that, I guess, but like, ideally, let's get a conversation.
I'll try. Maybe we can meet with them right now after this call, or even just... Feel free to reach out directly to David. You don't need me as a proxy. Just hit him up. "Hey, how are you planning on filtering these? Make sure your events are left on the queue."

**jeremy.campeau@llsa.com | 02:40**
All right. Yeah. I'll double-look into it and then just double-check with him.

**Wesley Donaldson | 02:44**
Alright, let me share my screen. Actually, while I have you both here, this is actually a good... So Antonio, the original... My original thinking was you'd help with some of the BI-specific projections.
That's very much tied up in what we're doing inside of the single process in Emmett per just Sam's input, as well as just the need for us to formalize what this schema looks like, I guess. Mike, what happened? I guess my question would be, how do you want to tackle that work? Jeremy is becoming available soon.
So my thinking was Jeremy can start looking into the projections as a mechanism to just get comfortable with how projections are working now in this new pattern. But more importantly, he can start the conversation of figuring out the schema. I saw Sam add this idea here. I don't know if this is real now and it's something we want to start using.
Then my bigger question is even if it's real now and it's something we want to use it, the BI team does... They currently have the ability to basically create an OVC connection or whatever the equivalent thereof for this and pull it into fabric or whatever tooling they're using or business intelligence tool, and they're using or do they have to go through a relational database?
If you don't know, that's fine.

**Antônio Falcão Jr | 04:13**
Mike, sorry. Yeah, I really don't know. What I can say so far is that we need a consolidated module, right? It's what we have been discussing in the meetings is one integrated model to serve either both the applications or...
But yeah, this red line... I'm not entirely sure about that, but I'm under the same impression that Sam's was suggesting that we could use that duck DB with secondary index and give the V team the ability to perform some queries over the stream.
But it's not connected to the stream, it's connected to the BI reporting. So I'm a bit confused.

**Wesley Donaldson | 05:01**
Exactly. I think my bigger worry is just a skill set issue. Even if this was real, my worry would be how... Are they comfortable consuming it? Will it fit in their workflow? What is the connector? Is it basic REST that they can get the data from like a super-based type thing, or is it an OVC connection?
How do we actually get to that data and then how do we ingest that data into whatever tooling they're using? Okay, so I'm going to hear the rediscovery on that.

**Antônio Falcão Jr | 05:33**
Yeah, just... I'm pretty sure that they are connecting directly to the RA TB just to make my position right.

**Wesley Donaldson | 05:34**
I think that's the simple answer.
That's my understanding.

**Antônio Falcão Jr | 05:44**
Yeah.

**Wesley Donaldson | 05:45**
Okay. So then the effort here sounds like it's going to be just... We need to actually have us sit down and do a schema. So we need to take what we have, what they have provided inside of, and then propose a schema and let that be a conversation.

**Antônio Falcão Jr | 05:52**
Correct. That is...

**Wesley Donaldson | 06:01**
Okay. So then as far as generating the proposed schema, that obviously takes into account models that we currently have as well, stuff that we are going to need to support. If that's the case, do you...? Is that something where. Jeremy. You can take that on.
And do you want to have more of a ownership in that? Antonio.

**Antônio Falcão Jr | 06:22**
No, I'm okay. I just have to say that those models we have now are pretty flexible. They were there pretty much to support this end-to-end integration, but they don't represent any specific business needs.
So we can change whatever we decide.

**Wesley Donaldson | 06:42**
I think I disagree with that because right now these are powering reports, right? So we would have to just be... I think we'd probably just need to create a view on this model. That way we don't break anything downstream.
But ideally we can just work with them and get the new ones working for the older content that they already have. I think a minimum case we need just to support them. Not really breaking. We should have a view on this model that can represent whatever this was generating.

**Antônio Falcão Jr | 07:08**
100%. I was referring to the new projections I have created to just illustrate the ACL integration because we have two new tables, three new tables for orders, ordered line items, and membership that are not... They are not business specifically, they are just new tables I just created to support this integration.
But we can keep using those or we can change them or we can just point out this reactor to the existing tables we have now. Whatever works.

**Wesley Donaldson | 07:51**
So tentatively, the worst-case scenario, we already have projections that you're used to demonstrate that in theory, the BI team can access.

**Antônio Falcão Jr | 07:57**
Correct.

**Wesley Donaldson | 07:59**
That's this guy here in theory, right? Without the action, the direction that we have from 17 is the idea that we should create this schema, spend the effort on making this model bulletproof, and then that will inherit the old need as well as the new need.
So I think we're missing something here. This needs to be... This is legacy and this is new... Recurly, right? New Recurly is what is... Do we agree?

**Antônio Falcão Jr | 08:39**
That's my... I don't know, that's my point. I was sometimes under the impression they wanted us to fully integrate everything. When I look at order, they will look for... Whatever it comes from Krisp or Recurly or Shopify, they will be the same source but not the same source.
They will end up on the same reporting or projection. It's just an impression. We need to confirm that. Suspicious. So I don't know if they want us to create a new one exclusively to recur it.
That's my point.

**Wesley Donaldson | 09:18**
Okay, it's fine. Let's leave this here, and then we'll just message Sam and see what he wants. But I'm going to take this as a next block of work for us, so we'll get a meeting on the calendar.
I'll get a task for us to distill this down into a proposed schema, and then I'll put something on the calendar for us to connect back with the BI team to review the proposed schema. I'm going to target Jeremy. What do you think, buddy? If we get...
If I write this up for you, have it for tomorrow morning, is two days enough? That's Wednesday, Thursday, and then we meet with the BI team on Friday just to review the schema and come to an agreement on it.

**jeremy.campeau@llsa.com | 09:55**
So the task is to make a new scheme based on what Recurly offers or is not.

**Wesley Donaldson | 10:00**
No. So we have existing projectors that service existing reports and BI, right? We have the in-process or the demonstration tables that Antonio has created for place orders, for order items, orders, and for member subscriptions, right?
Then we have a need from the... So many things open. We have a need that's been given to us by the BI team. So that's the confluence page that I sent to you. So that encapsulates their need for recurring going forward.
So we have three pieces of information that we need to combine together into one schema going forward.

**jeremy.campeau@llsa.com | 10:47**
Okay, so we need a new schema. But what you're saying is we don't... How can we make a schema if we don't know what they want yet?

**Wesley Donaldson | 10:54**
But we do. Well...

**jeremy.campeau@llsa.com | 10:56**
No, because they still need the legacy report. Is that what you're saying?
So we need the new reactor to be able to upsert data or whatever into that Aurora model for the existing orders and results and participants, which includes stuff from Thrive and Shopify. Then make sure that right now anyways, that the reactor can feed in data that still works accurately with the current BI report.
Then you said there's going to be a meeting to discuss what they need from Recurly specifically to feed a new set of reports or something or a new set of read models.

**Wesley Donaldson | 11:35**
So they already have that. Hold on, let me just grab this. Too many chats. Grey at last year.

**Antônio Falcão Jr | 11:50**
I believe... Jeremiah, that's part of the work to look for these KPIs they shared and see from the data we have now, if we are able to achieve those KPIs, if I'm not mistaken.

**Wesley Donaldson | 12:08**
Did I save this?

**jeremy.campeau@llsa.com | 12:08**
Okay, so this KPI is already in there.

**Wesley Donaldson | 12:09**
I did not save it. That's a good reason. Okay, so these are the things that they sent us over as their KPIs and some specific data elements that they're calling out, right?
So we effectively need to figure out what data we have that services these KPIs. That's one stream of work. Then, once we understand what data we have that services those KPIs, then that informs the activity of how to generate that schema, right?
Because that schema services what exists currently and then the needs that they have as well as these general projections that we want to do for the information that we have coming in for order placed and member renewal and that all comes together in this one schema.

**jeremy.campeau@llsa.com | 12:59**
Now, I think what we're saying is we need to make sure that we can get those things from the new...

**Wesley Donaldson | 13:08**
And yup.

**jeremy.campeau@llsa.com | 13:08**
And so this ticket that you're talking about is just identifying if those things can be okay.

**Wesley Donaldson | 13:16**
So, it's like identifying if they can be. So basically, a bit of mapping activity. "Hey, you're back on maps and proposing a schema based on what is known currently, the KPIs that they're asking for, and Antonio, that I feel is missing here."

**jeremy.campeau@llsa.com | 13:30**
Two.

**Wesley Donaldson | 13:32**
Like we would need to service these revolver the revolvers right inside of the graph QL like we can't break whatever currently works. But we in theory have new right. New resolvers control d.

**jeremy.campeau@llsa.com | 13:45**
Right.

**Wesley Donaldson | 13:48**
In theory, we have this here for the new recurring specific, right?

**Antônio Falcão Jr | 13:58**
Not necessarily, but yeah, sorry, you are correct. We have a recurring order resolver. Yeah, and membership recurring membership resolver over. That's correct. We have both of...

**Wesley Donaldson | 14:29**
Okay, I'll make those red. That's recurring membership. Come on.

**Antônio Falcão Jr | 14:38**
Correct.

**Wesley Donaldson | 14:55**
Okay?

**Antônio Falcão Jr | 15:00**
That's on top of that. I would like to mention that in order to achieve the KPI results or not results but the KPI data or... Or so to fulfill the KPIs, we could take into consideration the other webhooks we have available for subscriptions.
Just in case, because right now we have the path to consume new ones, it's easy to integrate extra ones. So my opinion and very personal/professional is instead of trying to make extra computations on our side to achieve that information, we can just consume more webhooks.
Right now we are doing five per subscription, but they have about fifteen. So they have many other information about membership. Just for your guys' information.

**Wesley Donaldson | 15:56**
I think that's the right call. I think we just need to escalate that to a larger team. I think you need to get states involved and be aware that we need to consume these additional webhooks and hydrate them for the sake of supporting this BI need.

**Antônio Falcão Jr | 16:11**
Yeah. I'm more calling this out to ask Jeremy to keep in mind if he's struggling to find data on the current projection to fulfill some KPIs, he'd take that. He could take that into consideration and just let us know. Hey, guys.
I think this webhook will give us the information so we can... But for now, I don't know yet. I just mentioned it. Right, so...

**Wesley Donaldson | 16:33**
That's a good call. All right. That's a whole stream of work. I think we need a separate meeting to close out the loop on this.
So let's pause here and let me just go back to the core ask of this meeting. So what do we have? We have Lance, Jeremy, and Tono. Okay, that's fine. I don't think there's anything here for you guys specifically, but I'll just open the floor and Tono, you can go first.
The goal that we're trying to get to is some green. At least one green per day, I think would be a great goal. I don't think we can move any of these to green based on not having Francis and JFFCO here. Is there anything here that we feel we can move to green or we want to give a...? Is it making progress or blocked?

**Antônio Falcão Jr | 17:19**
On the ACL side, it's still work in progress. I'm still testing it, so no, I have nothing on this meeting side to make green today, and I cannot speak for the rest now.

**Wesley Donaldson | 17:29**
Okay, yeah, I think we need... To speak to this. Just go and Francis, I can... Them tomorrow morning.

**Antônio Falcão Jr | 17:36**
I'm sorry.

**lance.fallon@llsa.com | 17:41**
Two.

**Wesley Donaldson | 17:43**
All right. What about you, Antonio? Lance? Lance, are you comfortable with me moving this to in progress work?

**lance.fallon@llsa.com | 17:54**
Yes, it's in progress.

**Antônio Falcão Jr | 18:00**
By the way, as soon as you have the... Exchange or topic I think SQS works with exchange. I don't know, you can share with me, please. Lens.

**lance.fallon@llsa.com | 18:15**
Okay, yeah, we're going to need... I'll discuss it once I reserve long, but we'll have to include this and I guess the relevant workflows so that whatever needs this queue can get the information it needs.
Like the ARN for instance.

**Wesley Donaldson | 18:39**
I think for the ARN, the only person who needs that is Antonio, right? Well, that's not true.
So Antonio, you need it and then Francis probably needs it, right? To make the event aware that these things are going to be pushing against it.

**lance.fallon@llsa.com | 18:57**
I guess my C who needs that? I'm referring to like a workflow that would need it.

**Wesley Donaldson | 19:03**
Go... What is this? This is okay. Let's just keep an eye on that, I guess. When we... I may move tomorrow's session earlier in the day just to give us time to actually connect and not just have this towards the end of the meeting.
So just be aware that I may move this to tomorrow morning. Okay, anything, Jeremy? I know you're making good progress on this. Are you comfortable yet in putting this? It's not in production, but it's in review right now. Correct?

**jeremy.campeau@llsa.com | 19:43**
Correct. I just put up a PR for it.

**Wesley Donaldson | 19:45**
Okay, who would you like to give you a PR review?

**jeremy.campeau@llsa.com | 19:50**
I think Lance is the only person that has access to the Azure repo.

**Wesley Donaldson | 19:54**
Okay, and I already filled in on this so we can kill it.

**jeremy.campeau@llsa.com | 19:55**
To be honest on our team.

**Wesley Donaldson | 20:00**
Okay. I would say David doesn't need to give you a review, but just make sure he's aware of the approach and you're already doing this. Make sure he's aware of the approach and how you're consuming events.
All right, I think that's it. Let's pause this conversation. I'll create another smaller meeting for a smaller group tomorrow morning for us to tackle this. I'll at least send you one initial ticket, Jeremy, to start looking at the existing projections.

**jeremy.campeau@llsa.com | 20:33**
Sounds good. Yeah. I'll take a look at the KPIs. If I have any questions, I'll send them to... So we have them for the meeting tomorrow. Or whatever.

**Wesley Donaldson | 20:40**
Perfect. I'm targeting... Well, we'll have an internal... But I'm targeting Friday. I want to get it on a calendar, and we'll see what we can bring to that meeting. Friday meeting would be with the BI team. I just... You're aware. I'm sure you noticed this, but like Claude and Antonio, we did... Tono took a really good pass that this is what his hydrated object looks like. There's some dehyd like hydration thinking on how to get to all of the individual...
If you need to look at these, some of that stuff that you normally have to go directly to the URL is probably distilled in one of these three Confluence pages.

**jeremy.campeau@llsa.com | 21:19**
Okay. I'll take a look at those two.

**Wesley Donaldson | 21:21**
All right, guys, thank you so much.
Sorry. Any questions, anything you want to cover off? Anything we missed?

**Antônio Falcão Jr | 21:30**
I think we are good.

**Wesley Donaldson | 21:32**
Yeah, apologies about another meeting first thing in the morning, but I think we need to get to JFFCO and Francis, so I'll...
I'll set something up for 10:30 tomorrow. Right, guys? Enjoy the rest of the day. Right?

