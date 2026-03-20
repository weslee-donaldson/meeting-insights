# LLSA, Recurly, BI Reporting - Mar, 20

# Transcript
**Wesley Donaldson | 00:24**
Good afternoon. Let's give everyone a couple of minutes.
Good afternoon. Still waiting for Jennifer, Christian, and most likely Beth will join as well. Gregg too, actually said he wanted...
There you go.
Yeah, we had a good amount of folks except... So I suspect they're all probably in one or two of the shared meetings.

**bethany.duffy@llsa.com | 02:36**
Been a busy Friday for a lot of people.

**Wesley Donaldson | 02:39**
Yeah, that's unfortunate that struggles to make the TGIF work.
Afternoon.

**bethany.duffy@llsa.com | 03:03**
Afternoon.

**Wesley Donaldson | 03:04**
All right, I think we have enough for a quorum here. Make sure this is being recorded. It should be. If it's not, it was not...
Okay, all right, good afternoon. A few folks here that I have not seen. At least apologize if I have seen you, and I have not made a point of introducing myself. Westadson, I am a member of the Mandalor team. I'm sure most of us here are aware that we have a sizable effort coming around adding recurring as a commerce option within our flow within our commerce flows.
So my hope for this meeting is it's one of many conversations that we'll have that we look to get some clarity on how we can support the BI team. Just getting you additional data. Ideally, it's probably going to look like us creating additional projections or updating maybe one or two projections to make sure you're getting the transparency and observability you need.
So my hope here is just... Let's have an open conversation of what are you currently consuming? What do you think might be needed to support recurring specifically, if there are obvious gaps? I think Tony and I were just having a really good conversation of "Do we need to start projecting out the source of the order into existing projections?"
So I want us to open the floor for those types of conversations.

**bethany.duffy@llsa.com | 04:23**
Can I just preface it with the two business flows?

**Wesley Donaldson | 04:26**
Yes, please.

**bethany.duffy@llsa.com | 04:26**
So the first one is basically online commerce. So our e-com legacy COM replacement and Shopify replacement. So any reports that were running around e-com orders or Shopify orders wouldn't need to have the same data populated from the recurring orders.
The other side of that will hopefully mostly be supported by what we already have. We have in our webhook, it's related, but adjacent to the online orders is the membership transactions that are happening in our automatic renewal process. Hopefully, we should be able to reuse a ton of the webhooks that you guys already have in any of the data that you're pulling.
Because it is just another order. It's just not being originated through our online front end. It is being originated through recurring automated systems. So those are the two different transactional flows that we have that we need to get those reports updated for the business.
For the renewal flow, that would be a replacement for any MA reports that we have today. So that's my context.

**Wesley Donaldson | 05:41**
Nice. Thank you, Beth.

**Speaker 3 | 05:46**
Yeah. So I can open the floor and we can start with the membership data. So the way I've been looking at it from the BI side and this is a little bit more downstream, but I just want to speak to it and maybe it'll add some context. We have two initiatives with the recurring membership data and how that leads into reporting.
So the two levels that I see it as number one, just insights. So from whenever we kick it off to understand from the business perspective that these members are in recurring and not only are they in recurring, but on a daily basis, we can see that they've been attempted to be charged. They were charged, they renewed. This is their new plan, this is how much they paid. These are the invoices, any outstanding balances, that sort of stuff. The second layer for our team is then going to be the marrying of the two sources of data of historical and recurring going forward so that we can have people look into existing reporting and without any real difference be able to see that from...
We'll just take 2026 from January. 2026 until post-migration to recurrly. They can see all the same information about how many active members we have, how many renewals are happening, what renewals are we expecting, and what's the status of all that stuff.
So the other way that I've been thinking about this is that second piece, the marrying of everything is going to take longer for us to put together. So in my mind, what's probably going to happen is we're going to have to get the business to feel comfortable and settle down a little bit as soon as we can provide information to say, "Hey, this is in recurrly."
You can see on a daily basis that things are happening as we are expecting them. They can at least survive off of that for a few days a week or whatever as we do the marrying of everything and try and put together that full view reporting back in place.
So yeah, from the recurrly membership side, that to me is like those are the high-level things that need to be understood: who's there, are they renewing, did they pay, are they in a retry status, have they canceled, when is their most recent planned start date, and how long does that... Shouldn't say plan that's... I think, an outdated or will be an outdated term, but there's a specific subscription.
What are the start and end dates to that? Those sorts of things.

**Wesley Donaldson | 09:14**
Okay, that all makes sense. You talked to multiple phases of the work there. To me, the insights feel like the most pressing. So I'd say three buckets there: what's there now should not be broken, right?
So making sure all that's still consistent. The next one down is ongoing ability to give the business clarity that the system is functioning. That feels like a dashboard-ish. So if I think about what is the source of that data that powers that dashboard, it sounds like we almost want to be almost at the stream level.
Individual events coming through that you guys can access and be able to generate a report based on that. That's my initial thought there. Don't you jump in here at any moment, please. Then the other bucket sounds a little bit more complicated to me. This idea of marrying in the marrying realm... Can you just, at a high level, is that trying to integrate existing data from existing reports that exist now, taking data that's now coming in from recurrently, and then effectively injecting that into existing reports and not necessarily creating something net new?

**Speaker 3 | 10:18**
Yes, I think you're right. So the way we're going to do that is from fabric. So I think through all those three phases, the important piece to us is just the insights and the ingestion of the data streams from recurrently.
Then those other burdens lie on our side, from my point of view. So we have to figure out what's the best way to marry these things together. We haven't gotten to this point yet because this is our first burying of historical and new data. In my mind, it probably makes the most sense that the source of truth when it comes to fields and that sort of stuff is based on what our new system is going to be.
Then we backload the historical data. So that things line up, whether it's the new terms and everything that are going to be used from recurrently. Let's go ahead and find a way that how that fits with our historical data, rather than "Hey, let's keep this historical data that's been here. We know some things are going to be outdated.
It's not going to make sense. Somebody logs in a recurrently and seizes it. Why don't we flip it on its head and let's use what's new and then just backfill the actual data points from our historical platforms."

**Wesley Donaldson | 11:43**
Okay.

**Speaker 3 | 11:46**
Yeah, and that'll all be our burden within fabric and the reporting itself.

**Wesley Donaldson | 11:52**
Understood. Can you give me a... For the insights? I think you sound like you have a good perspective. Of what?
It's the obvious stuff that we can push through, just like showing that orders are coming through, showing that membership is happening, and showing when there's a cancel, for example, of membership. That seems like the minimum bar. Do you have a sense?
Maybe it's written down already. Of what those key column KPIs that you'd want to keep track of in this insight bucket are.

**Speaker 3 | 12:17**
Yeah, and I think probably the best way is... Either myself or Ben will follow up with those. But yeah, it'll be things as far as on a daily basis, how many new members we have, which I know that's a future thing because until we get it fully migrated, we're going to have new in C-Star still.
How many new members we have, how many renewals were set to renew, how many of those were successful, and how many of those are in... Yeah, like a retry type status to where we know they were set card declined for whatever reason, and we're retrying that. To me, that's probably one that is going to expand compared to what the current state is because we do have the Dunning process.
So I could definitely see the business wanting more insights into... Okay, this person failed their renewal on March 21st. When did we retry them again? When was it successful? Those sorts of things.
Yeah. How many people canceled? What's the breakdown of what the cohort is for their current subscription type? So what do they know? Are they one-life monthly, are they one-life annual? Are they men's package, women's package, platinum, all that type of information.

**bethany.duffy@llsa.com | 14:05**
I... An perspective. Christian, we're probably going to want visibility into the performance of that process. So at what point in the Dunning process, which step did we get updated information? And we were able to successfully renew the previously failed membership that we can prove that process is in fact increasing our retention.

**Speaker 3 | 14:29**
Yeah, definitely.

**Wesley Donaldson | 14:31**
Yeah, I think that feels like the next phase. If I think about this, it's just what we do when we're working through Krisp versus what we do when we fully migrate away from Shopify towards Thrive.
I think I'm trying to just...

**Speaker 3 | 14:45**
So yeah, I think that is kind of a day.

**Wesley Donaldson | 14:46**
Go ahead.

**Speaker 3 | 14:51**
One thing, if I can call it that because it's from the business perspective. One of our reasons for choosing to go with Recurly is this Dunning process, which is a benefit that we haven't had in the past.
So I do think it is important to be able to show that value happening from the job.

**Wesley Donaldson | 15:14**
Gotcha. That's great insight.

**bethany.duffy@llsa.com | 15:16**
It is a brand new process for us to... So having that visibility right off the bat will help us fine-tune it because for the initial rollout, we're just going with a recommendation from Curly because this is what they do, this is what they know.
But there may be a need to fine-tune it to our own business use cases depending on what we're seeing. So I would like that information earlier rather than later.

**Wesley Donaldson | 15:40**
Okay, all right. I think just full transparency. I think we need to take that back and just distill and just generate some tickets, generate some expectations and requirements for that and have you guys confirm a great way into that. Seems like... Let's start with you. You mentioned that maybe Tomk could help me if I'm pronouncing that correctly. You or Benjamin could be the good source to just give us those initial reports you're currently having as well as the key data elements within those keys. I'd love to start with that. Thank you for the general direction around the day-one need.
That's a lot for us. Anthony, you had a question there. Sorry, what was it? You want to just raise your concern?

**Antônio Falcão Jr | 16:23**
No specific questions, I was just sharing the meaningful domain events we have so far. Just food for thought. We have a good track on membership chains. We don't have a specific membership resume coming from Rick Curly, but we may be able to get on that point by analyzing.

**Wesley Donaldson | 16:43**
To rightive?

**Antônio Falcão Jr | 16:46**
Yeah, they renewed some things like that. We need to understand how the re the API works. But in addition to those events, even the order one placed we do have the C star existing event is the created.
So we can kind of work with all of those events. They are rich in data to project or whatever we need. And we can make some computation on the projection side to make some extra enrichment data combination.

**Wesley Donaldson | 17:19**
So is there a specific...? We can use the models that we have already established. That speaks to just the amount of fidelity as well as the normalization state that we try to accomplish in the projections.
But is there anything like that, especially how deep do you want us to go on tables, how deep the relationships need to be that help make it easier to consume this downstream? That could be a soft business requirement for us as well.

**Speaker 3 | 17:48**
I'm trying to think, I'm going to be honest, that it's probably a pretty low bar because of you. The structure of membership data and how it exists in CSTAR today, it's pretty complex. And, you know, if anybody can speak to that to me, definitely can.
But, yeah, I mean, as long as, you know, when I think about it and I'm. I'm gonna try and talk through it and hope I don't trip over too many of the. The new terminology. But our. Our central point is kind of the accounts and or like if you think of them as members, and then outside of that, it's what is their subscription, what subscriptions, I'll say, have they had?
But we can even start with do they have because have they had is probably the historical side is going to be on ours. You know, the people ever knew day one they might have two in re curly. I would think the one we imported them with and then the one they just renewed to.
Then from there, it's whatever the attributes of that are, what plan it is, what cost that is, what's their status currently? Is there a change to their status? Whatever Dunning activities there are on that payment.
From there, what are the invoices? Are they paid? Is there a balance? All that kind of stuff.

**Wesley Donaldson | 19:47**
Nice. Okay, just playing this out to... I think it's always good to have raw information to work from, and we use that as a jumping-off point for additional customization. What are your thoughts?
Just maybe re-generating projecting out just the raw information we're currently getting for something like the membership account. For what? What do we see when we actually get a paused event? Would it be valuable for you to understand what all those individual fields are, or do you just want us to... I guess that's the question. Would that be valuable to you?

**Speaker 3 | 20:23**
Yeah, I think that'd be immensely valuable, especially dealing with the new system. Yeah, I think that'd be really good.

**Wesley Donaldson | 20:32**
We have a Confluence page right now that decomposes all of that. I'm happy to share that with you as a starting point, or I'm happy to maybe... Antono, we could just do a quick projection.

**Speaker 3 | 20:35**
Two.

**Wesley Donaldson | 20:41**
Would you be comfortable consuming the Confluence?

**Speaker 3 | 20:45**
Yeah, I think that's a great start.

**bethany.duffy@llsa.com | 20:49**
Would it be helpful to do something similar in the order place scenario? Do then.

**Wesley Donaldson | 20:56**
We have all the contracts. So basically we have all the events and then we have all the distillation of the contracts like what you hit in what order.
Then it generates this kind of hydrated object. So we have that all documented out. We can pass that along. So it should include... Off the top of my head, I can't tell you definitively, but it should include the order specifics as well.

**Speaker 3 | 21:16**
Awesome.

**Wesley Donaldson | 21:18**
Cool.
So yeah, it just gives me maybe an hour or so just to clean that up with Tad, but I'm expecting to get that over to you pretty quickly.

**Speaker 3 | 21:25**
Okay, perfect.

**Wesley Donaldson | 21:30**
Alright. Anything else? Antonio? Do you have any Elvis or Beth that you would like to cover?
I think let's get you the data. Then I think that's another set of conversation. I hear you on the general buckets. I think that gives me enough to at least start roughing out some ethics or roughing out some tickets.
Then obviously I'll get that back in front of you, Christian, if I can ask you to just try to prioritize getting me those keep eyes and those existing fields because ideally if there's day one content, I want to see if I can refine it down.
But no later than Monday to give the engineers time to action it early next week. So if I could ask you to please just prioritize that for today or early Monday morning.

**bethany.duffy@llsa.com | 22:07**
One of my main concerns is replicating the Shopify data report that we have that the support team works off on a daily basis.
We need to make sure that that's available day one for any recurring transactions. They do work that every single day.
There are usually orders that are failing that they have to go in and contact customers about. So that's probably my main concern, just to make sure that people we're catching any order failures so that people can still show up for their appointment.

**Speaker 3 | 22:43**
Cool. Yeah, we will definitely share that one as well.

**Wesley Donaldson | 22:51**
Okay. So just a quick action item for me to get you back that confidence on your team to get me back KPIs and just existing reports on how you're consuming them. On me to distill that down and I want to get a rough pass of tickets by you. I'm targeting Monday just so we have enough time.
So I'll stay in contact with you guys. We'll share that. If I have any questions, I'll pay them over to you. Who's the point? Who would you like me to be the point on that is you, Christian? Is it someone else?

**Speaker 3 | 23:20**
So I will actually be out for the next two weeks. So if you want to just hit... But you can include me and stuff still. So if you just want to hit this group of three, I think that'll be good.

**Wesley Donaldson | 23:31**
Perfect, that's ideal. Okay, Antonio, Elvis, any questions, concerns, or initial thoughts?

**Antônio Falcão Jr | 23:40**
No, I'm good. Probably we will be able to go up them as soon as we have contact with the material.

**Speaker 3 | 23:46**
Yeah.

**Wesley Donaldson | 23:47**
Nice. Okay, guys, thank you so much. Super important to get ahead of this, right? So thank you so much for sharing the information, and I'm just being open to having this even though we don't have the final data in the system. Just see for your review of his...

**Speaker 3 | 24:02**
No, I'd say from our side, I think I'll speak for all of us because I think this is true. I really appreciate this meeting because these are the things in the past that we've wanted to have in place and...
Like you said, get ahead of things. It helps us quite a bit. I mean, it helps our delivery too, so, no, we very much appreciate it.

**Wesley Donaldson | 24:23**
Nice. Okay. All right, guys. I can give five minutes and some change.

**Speaker 3 | 24:26**
Awesome. Are you rich?
Thanks.

**Wesley Donaldson | 24:31**
Do.

