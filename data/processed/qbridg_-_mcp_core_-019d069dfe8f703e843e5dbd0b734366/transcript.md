# Qbridg - MCP Core  - Mar, 19

# Transcript
**jessica@terraquantum.swiss | 00:01**
You have a very professional one there.

**Nicolas Berrogorry | 00:04**
Yeah, I if I turn on off the RCV light, it stops working.

**jessica@terraquantum.swiss | 00:10**
Look like you look like a podcaster there. [Laughter].

**Wesley Donaldson | 00:15**
Wait. I totally missed that. If you turn off the RGB, the mic just doesn't work.

**Nicolas Berrogorry | 00:20**
Nah, I'm just messing around. It's if.

**Wesley Donaldson | 00:22**
Okay.

**Nicolas Berrogorry | 00:23**
Yeah, it was just turned off.

**Wesley Donaldson | 00:26**
That would be funny.

**Nicolas Berrogorry | 00:28**
It's interesting its capacity.

**Speaker 4 | 00:39**
Jessica, are you feeling better?

**jessica@terraquantum.swiss | 00:41**
Yes, not and you know, I think I'm in 90%, but still better than this week.

**Speaker 4 | 00:49**
Okay, fantastic, thank you. All right, when I was... Every time I get a hint of a cold, I will juice at least three lemons and put them in a liter of tea and try to burn it out via the lemon acid.
So, if I can recommend acid treatment. [Laughter].

**jessica@terraquantum.swiss | 01:08**
Thank you.

**Speaker 4 | 01:10**
Yeah.

**jessica@terraquantum.swiss | 01:11**
Yes. Ginger and tes of, you know, different nice herbs have been used a bit of time as well, but it's much better. Thanks. Hi, Ryan. Morning.

**Speaker 5 | 01:34**
Good afternoon.

**Wesley Donaldson | 01:35**
Good morning. Afternoon.

**Speaker 4 | 01:37**
I think Jeff has a conflict. I'm not sure which meeting he'll be in today.

**jessica@terraquantum.swiss | 01:43**
Let me see if he responded. Because I saw Roman said conflict, but Jeff particularly didn't say anything. Didn't write me. So we can anyway start and do the demo recorded as usual, and then let me see you join in between.

**Wesley Donaldson | 02:07**
Sounds good.

**jessica@terraquantum.swiss | 02:09**
Is that okay?

**Wesley Donaldson | 02:10**
Yeah, that's a great idea.

**jessica@terraquantum.swiss | 02:11**
Okay, and let me start the recording.
Not here.

**Wesley Donaldson | 02:23**
Nice. Okay, so we have a few items to share.

**Speaker 4 | 02:27**
Recording in progress.

**Wesley Donaldson | 02:29**
We have a few items to share, and I think a good amount of conversation we'd love to have with you guys as well. Just a couple of quick points about what we're going to share.
I think one of the natures that we've learned here is that not everything is going to translate to a... It's going to translate back to a feature. But there's a lot of really good thinking that's been done and explorations that are done, and we want to share those with you guys and share our rationale for why maybe some of those are not dead-ended, but I've come to their natural conclusion.
So we're going to take you through some work in progress stuff, specifically around circuit categorization. We had a great conversation with Rubens about how maybe a generalized approach is not the best in every situation.
So we'll talk a little bit through how that applies to our pursuit of open-source circuits and sample circuits, and then we'll talk through some improvements we've made around circuit variation, variants, and how we're presenting those, how we're using an LLM versus how we're using Kiskit.
Then we'll talk about... We'll talk to Don. He will speak to the work that we've done around how we are visualized, how we're representing circuits historically, specifically within the... Context. Really interesting stuff, right?
So let's jump straight in. I'll hand it over to Nicholas to start the conversation, and Don will have a really interesting UI presentation around his demo as well.

**Nicolas Berrogorry | 03:51**
Okay. So I have a couple of things to share today, and I will start with the Shore algorithm sample. So, to ground us all on what I am about to share, basically, we had set up and on the last week to begin trying out what happens with this pipeline when we pass through more complex circuits that are larger than one cubit but not yet like a thousand cubits in length.
Like a GE circuit or... Or those types of circuits. This conversation that we had around the taxonomy of circuits and the types of problems that are solved with quantum circuits from the giant literature of quantum circuits.
Basically, we found that there is a type of circuit that is classically verifiable. That means that in theory, for us, it should be the easiest type of circuit to validate in our quest to be able to do some validation process for the circuits.
We had a conversation with Rinor last week where we found that maybe we should try, for example, the short algorithm for a small number. The short algorithm tries to do the factor decomposition of a number, which is, for example, if you have 15, you know that 5 by 3 are the primes that make up 15. You multiply 5 by 3 and you get 15.
So, how can we run that circuit? Well, the math I'm not going to go over it today in detail because I don't think that it is necessary. It is a bit complex, it's using stuff called a quantum transform.
It really revealed how complex these circuits are for the people that know what they're doing, basically the scientists using them. So, that was helpful for us to understand the complexity of the sequence itself and to be able to at least breeze through that area.
Yeah, I basically inputted from one of the samples the short algorithm circuit for 15 and I ran it through the pipeline. The finding was that the graphs that we had before the first graph that we had were not clear for us to extract the result to be able to do the post-processing required.
We found that our quest for creating a generalized validation is a little bit open-ended because it's a huge complexity. Rinor basically pointed out to us that maybe we don't have to generalize as we Sales and maybe when we have to support some specific cases, we try to leave that to the user.
So, that is something that may inform the. The continuing work that we are going to do is that we're not trying to share all aspects of quantum into a pipeline at least yet, maybe over time, but we are trying to continue creating small increments that are meaningful.
So I basically did two small things to be able to test this squid. One is the squid diagram UI we were using a custom-made SBC generation. It was pretty, but it was not necessarily correct all of the time.
So I migrated to using the keysk diagram generator, which we can trust. It's made like Kiskit is part of keyskit. And basically, we had some issues where we weren't able to see the entire set because of some scrolling issues.
So what I did was create just a pop-up. You can click on the circuit, and you can see the entire circuit. For reference, this is a short algorithm circuit for seven. When we run it through the pipeline, we get peaks at different outputs.
So these are all the possible outputs for four cubits. You can see it: zero, one, etc. I'm not going to worry you with the math, but looking at the peaks, you can see basically if the show algorithm is working.
Exactly for Gen...

**Speaker 5 | 08:25**
Because I don't see anything.

**Nicolas Berrogorry | 08:26**
Sorry, buddy. Okay, thank you so much. I haven't been sharing my screen. No problem. My god, this is the stuff on the top. Yeah, go... No, but, back from the changes, basically here are the changes that were needed. The secret diagram has some scrolling issues, so just added this short circuit. It shows you the assumed fit circuit. Do you not know how to scroll it?
If you want to zoom in, you can click and zoom in and explore the circuit. That's a UX improvement, my tiny improvement. Then, what I was mentioning was the graphs here. These graphs were not from the result bureau, were not... We're not basically useful for extracting results in a genAI way out of the sets.
So the picks that I was mentioning are these. Basically, if you know what your set is doing as a user, you can look at these peaks and figure out if these are the peaks that you are expecting to validate the result yourself.
In this case, the peaks are exactly what we are expecting for the short algorithm for '15. Basically, what this means is that the face is one-fourth. Math. And doing the... You can figure out if this is the correct phase.
It is, and you get basically five and three, which are the multiples. So we can now say that the pipeline is correctly ingesting a circuit, running it, plotting the result in a useful way that we can validate. Sure. We found a mistake with Reben on our last conversation. Basically, when we go and take a look at the QM variant that was produced by the pipeline by the QMM mentioned, we find... We found that... Basically, it created it and added the QMM for one Q in parallel, so it didn't really generalize. It didn't really understand QMM at all. It seems... Yet the agent it did invest in, and it invested was to add three more cubits and sort of like LQM in parallel to nothing really.
So yeah, the result is that the QMM variant producer will need some work. Here is the order for reference. If you look at this one and then go back and look at this one, you can see that it's the same circuit, but with three more Qs at the top.
That's not what we wanted. Didn't really intervene with the circuit. We are working on that next. So that's regarding the line of work with a specific sample taking it slow. We're not trying to grab the entire circuit taxonomy of the universe. We are trying to just know that it works for some specific sales and making progress towards that.
The next item is... We may want to slowly build a database. Well, we want to slowly build the database. That's what has been proposed by Bryan in his document with the prior lookup and all of that.
We talked about RAG and how we can use that to build that database and build a similarity matching for circuits and maybe use that for a secret categorization. There is this thing called knowledge graphs.
We may want to build a knowledge graph so that everyone can open that knowledge graph and see what this taxonomy I'm talking about really looks like. It may help everybody understand. So if you want, if it's agreed on your side, we can do an experimentation with knowledge graphs because it's a collation to RAG. Regarding RAG, we need data and data means sequences.
So I set up... To find as many secrets as I could that are open source. I found a group called the Quantum, the Munich Quantum Group, which has something called the Munich Quantum software stack.
It's a part of the European Union, a technical university of Munich. There's a private company, I think, called the Munich Quantum Software company, and basically they have this toolkit, which is a toolkit for benchmarking, for example, software like Krisp.
Luckily, they provide a huge database of quantum circuits that we can use to put in a RAG. I can hand it off to... To talk about how we use that and how we can use that in the future.

**Wesley Donaldson | 13:32**
Maybe let's take a pause there, maybe open the conversation.

**Nicolas Berrogorry | 13:33**
West. Okay.

**Wesley Donaldson | 13:36**
Any initial thoughts from the Munich Quantum team? Just the idea of using an open source database for circuit types. Does anyone have any familiarity with the Munich Quantum toolkit? Anyone have thought on the approach?

**Speaker 4 | 13:53**
No, I like this approach so far. I would probably validate the DB with Rinor because he'll be most familiar with it, but I'm not sure if he was the one who recommended this, but I think this is a good approach.

**Brian | 14:06**
Yeah, this makes sense to me too. I mean, even talking about Rinor, he just suggested just randomly generating them too. So this is probably a better place to start than random. So it makes sense to me.

**Wesley Donaldson | 14:19**
I think we're combining efforts. I think Rinor's general direction is just more focused on a known set, while this is a much larger available set.
So the non-set is the sure algorithm exploration as an example. But we're combining both efforts. Cool. Right. Down to you.

**Speaker 5 | 14:52**
Now, right. So, as it already was spoken on the last week, we presented our proposition of the RAC system and how it's going to be, how it could be implemented and went a step further. Actually, I implemented the direct system.
So, it's not in the final shape. It's something that we have already and we're using to test and debug and understand layers and how those circuits are converted into the embeddings and so on. So, for the circuits embeddings, let's say we use a PostgreSQL with PG vector plugin that actually allows us to store vectors, and then look up for similar vectors in terms of finding similar things in the database.
So, yeah, that was implemented. To test how it works, I also added four layers to the code base. Those that one was explained one week ago like the WL structure. Taking, for example, metadata from the circuit like the Cubits Gates parameters and so on.
This is by the layer, by the function of the layer, it's converted to the vectors, and those vectors are stored to the database. Yeah, and to somehow see how it works and understand how it is, I added two notes, actually. The QM ingestion that actually stores embeddings to the database and the QM prior lookup that looks for the similarities.
Yeah, so, for example, we can take that, we can take the circuit, we can take the simulator, and QM ingestion, for example, there is a very basic circuit we just want B2 gates. So, yeah, there is a database circuit embedding table that is empty right now, but when we... Weird, that worked a minute ago.
Okay, it works. So yeah, it takes the circuit from the circuit input, it goes to the simulator. The simulator runs the circuit and produces output and that output is stored to the file storage as a circuit and results of the simulator and embeddings of the circuit are converted and stored to the database, which we can see here.
It's the embeddings like an array of numbers. So it's like that. Yeah, so that's the QM ingestion. Another thing is a QM prior lookup so let me create another pipeline to show how this one works.
Okay, so, here we have actually the same circuit as the previous one, so we can assume that why it doesn't work. Okay, that's weird. It works after three times over it but yeah, we can see that the QM prior lookup gets the basic circuit and it tries to find a similar one in the database and it says that it's found just one because we have only one in the database.
The similarity is like the 100%. We can see that this is actually E95, which is the same ID as it's in the database. In this example, it's actually easy to understand even for me, but I'm not really in quantum.
But if you are looking for actually the same circuit as we already have stored in the database and we are trying to find the same one, it's obvious that the results are like the 100% similarity. But we can take something more complex, let's say, like this circuit, which is absolutely different than the basic one.
When we try to run the pipeline and find the priors, it says that the similarity is 33%. I'm not really sure about how correct those data are and actually what it means that the circuit is 33% similar to under 1 or even 75%. 2% or so on.
But to at least try to answer that question, I thought that it's going to be nice to have another tool which is a thing that uses the same logic, the same codebase, but instead of using four or actually five layers to create vectors, we can pick the layer we want. We can take the WL structure, we can take the resource profile. We can take as many as we want and a lot of combinations of that. It allows us to test, for example, step by step, if each layer works as we expect.
How can we improve that layer to be sure that it works correctly? We use here the same database, but different tables. So for example, when we decided to have a WL structure layer as the layer that we want to test, we should be sure that the database table stores only embeddings that were converted by the same layer to not mess up with different layers in the same database.
But we are trying to find vectors converted by different layers. So if it can make some mess... But here we can create a database table with just one layer. So we can see that we have some of them, like the DB and WL structure table, which is actually here as well.
It includes 180 circuits. All of those circuits are from the website that Nicholas already mentioned about. So they all of them are actually written in open Quasum 2.0 but Krisp has a way to import them as 2.2.0 and export as 3.0.2.
So that actually is what we do in the system to have the same version as we suffered in the pipeline. So yes, for example, let's start with the easiest one, which is the resource profile. So here we can select as many layers we want. Here we can have a that's another thing that's worth to mention.
So by when we have selected resource profile and we click in just circuits, we use, those circuits that are from the Nicholas Mention website that was mentioned, and we convert that and store to the database into the file storage so we can create those tables as we want.
Yeah. So when we have this resource profile and the resource profile layers is selected, here we have a basic circuit. We can click search and we can see how it actually M how looks the how those embeddings look like.
So, for the resource profile, embeddings are built from four dimensions, which means, for example, number of cubits, where maximum is 1 hundred to twenty eight. So we take the number of cubits of the circuit divide by 128.
And that's the number that we used to create embeddings and similar for other like gates DE and number of prams. So yeah, we can see that most of them, like for example the first one, which is not exactly the same, but pretty similar. Both of them are using two gates and one cubit.
But I would say there are those parameters are different, but it says that it's like 100% similar to the baseline to the original one. So it shows us how that kind of layer works. And actually, for me, it helps me to understand and dig deeper into the codebase to, you know, somehow, improve that layer. Or.

**Speaker 4 | 24:11**
So got a quick question right here. So we've got the original circuit on the left and the similar circuit suggestions on the right. What are the similar circuits being evaluated on? Is it just the ChatGPT code or is it the number of cubits count?

**Speaker 5 | 24:27**
For this particular example, we use this circuit and the... So Krisp gives us the metadata like number of cubits, Git depth, and a number of arms, and those information are converted into the embeddings and those embeddings are stored to the database.
Then we want to find a similar one. We do exactly the same with once again and those that are already stored in the database, they went through that process. So all of those circuits were converted into the embeddings by those data.
When we want to try and find a similar one, we do exactly the same with the circuit on the left. So we create vectors and then we find the closest vectors in the database for them.
That's why we...

**Speaker 4 | 25:24**
So it's a vector nearest neighbor kind of... Yeah, okay, got it. Yeah.

**Speaker 5 | 25:30**
Yeah. Wes.

**Wesley Donaldson | 25:33**
Dom Nicholas, maybe you want to speak to just our thinking of how this fits into the larger pipeline, the value it brings, the idea of maybe looking at historical processing, applying QM to a particular circuit and seeing what those results are and how that's relevant to a new circuit that we might be testing.

**Speaker 5 | 25:51**
Yeah, sure. Actually, at the moment this system is in the process of implementing and testing the bugging and so on, but it can give us... Actually, that's the thing that the system can give us.
So when we have a circuit that we want to run on a Krisp simulator or maybe in the real hardware like IBM, we can before we go to the IBM, look up our database and find a circuit that we already ran in the past.

**Wesley Donaldson | 26:29**
Of public...

**Speaker 5 | 26:33**
We store all information with results and so on. So we can actually... It can give us... We can predict before going to IBM what we can expect by running the circuit in the real hardware, so we can get that information before going there.
It can actually help us to... I don't know, prevent spending money or. So if that makes sense, I hope it makes sense. Maybe, Nicholas, you can add something more valuable to that.

**Nicolas Berrogorry | 27:09**
I would say more valuable. But maybe adding some extra comments. I think that what you said is correct. And amongst other possible usages for finding similarities, I think that's probably really well thought of previously because we are what we're trying to do here is to implement one of the stages of the specifications from Chef, which is the prior lookup. The twist that we are running into is that we are not doing a hard lookup on the circuits. We are basically doing a fast lookup, which is the term that I really like from Bryan. The other thing that this type of system can help with is by using any model that we want to use, even an LLM, or even if we don't train it ourselves, it will generalize better when it has more samples.
So if you're trying to apply some modification to a sequence and you have a later of similar sequences that you've already run, as you mentioned on real hardware, where we have data for the... There is a much higher chance that a model will generalize for generating new data or variations of circuits if we have data about, for example, some user feedback.

**Wesley Donaldson | 28:30**
If we have a state that I want to, for example, consume on but which feature we were telling because I have different reasons that can... So chair I at the... To an or district but that why the so a and yeah that helps the market will be different than...

**Nicolas Berrogorry | 28:37**
So not only results, but which circuits were selected by users for different reasons that can be used to help generate better variants. I think that is the whole purpose of the Q and prior lookup. I may be wrong or confusing terms, but that's my understanding so far.
Yeah, that's why I think a system like this helps. And the magic will be, I think, on the layer definition. So having this tool that Domate is insanely useful for developing each individual layer, trying different combinations of these layers, and seeing what gives accurate results.

**Wesley Donaldson | 29:05**
So... I don't have... Of... Behavior... As... Adul...

**Nicolas Berrogorry | 29:16**
For example, if we put in an input circuit, we get on the output, we get relevant results and not random results that we don't want.

**Wesley Donaldson | 29:23**
Have regular reports and. And that.

**Nicolas Berrogorry | 29:28**
That's a point that Brian made. How do we know that we're not missing results, etc.?
Well, this test bench should be the place to experiment with that. That's really not going to be a perfect solution, but a good solution, and that's what we should probably aim for.

