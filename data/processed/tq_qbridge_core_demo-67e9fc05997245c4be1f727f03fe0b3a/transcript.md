# Tq Qbridge Core Demo - Mar, 23

# Transcript
**Wesley Donaldson | 00:00**
Two items to share.
We have a few items to share, and I think a good amount of conversation we'd love to have with you guys as well. Just a couple quick points about what we're going to share. Some of it, I think one of the natures that we've learned here is
not everything is going to translate to a UI, it's going to translate back to a feature, but there's a lot of really good thinking that's been done and explorations that I've done, and we want to share those with you guys, and kind of share our rationale for why maybe some of those,
not dead-ended, but I've come to their natural conclusion. So we're going to take you through some work-in-progress stuff specifically around circuit categorization. We had a great conversation with Ruben about, like, how maybe generalization, a generalized approach is not the best in every situation, so we'll talk a little bit through, how that applies to our pursuit of open-source circuits.
and sample circuits, and then we'll also talk through some improvements we've made around the circuit variation, variants, and how we're presenting those, how we're using an LLM, versus how we're using Qiskit. And then we'll also talk,
We'll talk to… Don will speak to the work that we've done around how we are visualized… how we're representing circuits historically, specifically within the RAG context.
Really interesting stuff, right? So, let's jump straight in. I'll hand to Nicholas to kind of start the conversation, and Don will have a really interesting UI presentation around with his demo as well.
excuse me.

**Nicolas Berrogorry | 01:24**
Okay, so, I have a couple of things to share today, and I will start, like,
call start with the… with the shorter algorithm, samples, so,
to ground us all on what I'm about to share. Basically, we set up on the last week to begin trying out what happens with, with this pipeline when we pass through more complex circuits, that are, were larger than one qubit, but not yet, like, a thousand qubits, in length, like,
QAOA circuit or, or those types of circuits. And, this all, conversation that we had around.
The taxonomy of circuits and the types of problems that are solved with quantum circuits from the
giant, literature of, of, quantum circuits.
And basically, we found that there is a type of circuit that is classically verifiable, that means that it should, in theory, for us, be the easiest type of circuit to validate in our quest to be able to do some validation process for the circuits.
And we had a conversation with Ruben last week where we found that maybe we should try, for example, the short algorithm for a small number.
The short algorithm tries to do the factor decomposition of a number, which is, for example, if you have 15, you know that 5 by 3 are the primes that make up 15. You multiply 5 by 3, and you get 15. So,
how can we run that circuit? Well, the math, I'm not gonna go over it today in detail, because I don't think that it's necessary, and it's a little bit complex. It's using stuff called quantum Fourier Transform, and it really revealed, like, how complex these circuits are for the people that know what they are doing, basically the scientists using them.
So, that was helpful for us to understand the complexity of the sequence themselves, and to be able to at least bridge, like.
With that, with that area. And, yeah, I basically inputted, from one of the samples, the circu… the shore algorithm circuit for, 15, and I ran it through the pipeline. The finding was that, the graphs that we had before, the first graph that we had.
We're not, clear for us to extract the result to be able to do the post-processing required.
And we also found that our quest for creating, like, a generalized validation, is a little bit open-ended, because it's a huge complexity, and Ruben basically pointed to us that maybe we don't have to generalize, as Wesley said, and maybe we only have to support some specific cases and try to leave that to the user. So that is something that may inform the continue
work that we are going to do, is that we're not trying to generalize every single aspect of quantum into its pipeline, at least yet.
Maybe over time, but, we are trying to continue creating, like, small increments that are meaningful.
And, so I basically did two things, two small things to be able to test this secret. One is, the secret diagram, UI. We have… were using, custom-made, SVG generation.
it was pretty, but it was not necessarily correct all of the time, so I migrated to using the Qiskit diagram generator, which we can trust. It's made by Qiskit, it's part of Qiskit, and basically, we had some issues where we weren't able to basically,
see the entire circuit, because I'm scrolling issues, so what I did was create just, like, a pop-up. You can click on the circuit, and you can see the entire circuit. And for reference, this is a short algorithm circuit for 7.
And when we run it through the pipeline, we get peaks at different outputs. So these are all the possible outputs for 4 qubits, and you can see it's 000, 0001, etc.
I'm not gonna bore you with the math, but looking at the peaks, you can see, basically, if the short algorithm is working, and exactly for…

**Sam Hatoum | 05:57**
Because I don't see anything. Sorry, buddy.

**Nicolas Berrogorry | 06:00**
Okay, thank you so much. I haven't been sharing my screen, no problem. Oh my god…
This is the…

**Sam Hatoum | 06:12**
Start from the top.

**Nicolas Berrogorry | 06:13**
Yeah, no, but back from the changes, basically, here are the changes that were needed. The circuit diagram has some scrolling issues, so just added this. This is the short circuit.
It shows you the zoomed, the fit circuit. You don't have to scroll it. If you want to zoom in, you can click and zoom in and explore the circuit. That's, like, a UX…
my, tiny improvement. And then, what I was mentioning, was the graphs here. These graphs were not, from the result bureau, were not,
were not basically useful for extracting results in a generic way out of the secrets, so the peaks that I was mentioning are this, and basically, if you know what your secret is doing as a user, you can look at these peaks and figure out if these are the peaks that you are expecting to validate the results yourself.
And in this case, the peaks are exactly what we are expecting for the short algorithm for 15. Basically, what this means is that the face is 1 fourth, and
math, and…
do… doing the, the co-prime, you can, figure out, if this is the correct phase, and it is, and you get basically 5 and 3, which are the multiples. So we can now say that the pipeline is correctly ingesting a circuit, running it.
Plotting the result in a useful way that we can validate, sure.
We also found a mistake with Ruben on our last conversation. Basically, when we go and take a look at the QMM variant that was produced by the pipeline, by the QMM agent.
We find… we found that,
basically, it created… it added the QMM for one quid in parallel, so it didn't really generalize, it didn't really understand QMM at all, it seems, yet, the agent.
It did its best, and it best was to add, like, 3 more qubits, and sort of, like, add QMM in parallel to nothing, really. So, yeah, the result is that QMM variant producer will need, some work. Here is the order for reference. If you look at this one.
And then go back and look at this one. You can see that it's the same circuit, but with 3 more qubits at the top. That's not what we wanted, didn't really intervene with the circuit, and we are working on… on that next.
So that's regarding the line of work with a specific sample, taking it slow, we're not trying to grab the entire circuit taxonomy of the universe, we are trying to just
know that it works for some specific samples and making progress towards that. And,
The next item is, okay, we may want to slowly build a database, and… well, we want to slowly build a database, that's what has been proposed by Brian, by Chef's document, with the prior lookup and all of that.
And, we talked about RAG and how we can use that to build that database and build similarity matching for circuits.
And maybe use that for a secret categorization.
There is this thing called knowledge graphs, and we may want to build a knowledge graph, so everyone can open that knowledge graph and see what this taxonomy that I was talking about, really looks like, and it may help everybody understand, so if you want, if it's agreed on your side, we can,
do an experimentation with, knowledge graphs, because it's a cool addition to, RAL.
And, yeah, regarding RAG, we need data, and data means secrets, so I set up, to found… to find as many secrets as I could that are open source, and found a group called the Quantum, the Munich Quantum Group.
Which has something called the Munich Quantum Software
Stack, and it's a part of European Union, Technical University of Munich, there's a private company, I think, called Munich Quantum Software Company.
And basically, they have this toolkit, which is a toolkit for benchmarking, for example, software like Qiskit.
And, luckily, they provide a huge database, of, quantum circuits that we can use to put in a rack, and yeah, I can… I can hand it off to Domna to talk about how we've used that, and how we can use that in the future.
West?

**Wesley Donaldson | 11:06**
Let's maybe take a pause there, maybe open the conversation. Any initial thoughts from the TerraQuantum team on just the idea of using an open source database for circuit types? Does anyone have any familiarity with the Munich Quantum Toolkit?
Anyone have thoughts on the approach?

**Anya Schukin | 11:26**
No, I like this approach so far. I would probably validate the DB with Ruben, because he'll be most familiar with it, but I'm not sure if he was the one who recommended this, but I think this is a good approach.

**Brian DeFeyter | 11:39**
Yeah, this makes sense to me, too. I mean, even talking with Florian, he just suggested just randomly generating them, too, so this is probably a better place to start than random.
So it makes sense to me.

**Wesley Donaldson | 11:52**
I think we're kind of combining efforts. I think Ruben's general direction is just more focused on a known set, while this is a much larger available set, so the known set is the sure algorithm exploration, as an example. But we're kind of combining both efforts.
Alright, Dom, to you.

**Dominik Lasek | 12:14**
Yeah, sure, so, let me share that screen.
Right, so, as is already was spoken,
on the last week, we presented our, proposition of the rack system and how it's gonna be, how it could be implemented. And to end a step further, and actually, I implemented the rack system, so,
it's not in the final shape. It's something that we have already, and we're using to test and debug and understand the layers, and how those circuits are converted into the embeddings, and so on.
So, for the… for the circuits, embeddings, let's say, we use a Postgres with, PGVector plugin.
That actually allows us to, to store vectors, and then look up for similar vectors, in terms of finding similar things in the, in the database. So, yeah, that was, that was, implemented.
And… to test how it works, I as well,
Added 4 layers, to the codebase.
those that was explained one week ago, like the WL structure, taking, for example, metadata from the circuit, like the qubits, gates, parameters, and so on, and this is, by the layer, by the function of the layer, it's converted to the vectors, and those vectors are stored to the database.
Yeah, and to somehow see how it works and understand, how it is, I added to the pipeline, two notes, actually the QMM ingestion.
That actually store, embeddings to the, to the database, and the QMM prior lookup that looks for the similarities. And, yeah, so, for example, we can take that, we can take the circuit, we can take the simulator, and QMM ingestion.
for example.
There is a very basic, circuit with just one qubit, two gates, so, yeah. There is a…
database, circuit embeddings table, that is empty right now, but when we It's weird.
That worked a minute ago. Okay, it works. So yeah, it takes the circuit from the circuit input, it goes to the simulator, simulator runs the circuit and produce output, and that output is stored
to the file storage as a circuit and the results of the simulator, and embeddings of the circuit is, are converted and stored to the… to the database, which we can see here. It's… the embeddings look like the array of numbers, so it's… it's like that.
Yeah, so that's the… that's the QMM ingestion. Another thing…
is a QMM prior lookup, so let me create another pipeline
To show how this one work…
Okay, so, here we have actually the same circuit, as the previous one. So, we can assume that the…
Why it doesn't work, okay, that's weird, it works after 3 times a repeat, but yeah. We can, we can see that the QMM prior lookup, get…
The basic circuit.
And it tries to find the similar one in the database, and it says that it's found just one, because we have only one in the database, and the similarity is, like, the 100%.
we can see that this is actually E95.
Which is the same ID as it's in the database.
In this example, it's actually easy to understand even for me, when I'm not really in quantum, but if we are looking for, actually, the same circuit as we already have stored in the database, and we are trying to find
the same one. It's obvious that the results is, like, the 100% similarity.
But we can take something more complex, let's say… like…
this, this circuit, which is absolutely different than the basic one. And when we try to run the pipeline and find the priors, it says that the similarity is, like, the 33%.
I'm not really sure about how correct are those data, and actually what it means, that the circuit is 33% similar to another one, or even, I don't know, 75, 2%, or so on. But, to at least try to answer that question.
I thought that it's gonna be nice to have another tool, which is,
Which is a thing that uses the same logic, the same codebase, but instead of using
4 or actually 5 layers to create vectors. We can pick
we can select any layer we want. We can take the WL structure, we can take the resource profile, we can take as many as we want, and a lot of combination of that. It allows us to test,
For example, step-by-step, if each layer works as we expect, and how can we improve that layer to
to be sure that it works correctly. We, use, we use here the same, database, but different tables,
So, for example, when we decided to have a WL structure layer as the layer that we want to test, we should be sure that the
Database table stores only embeddings that were converted by the same layer, to not mess up with
You know, different layers in the same database, but we are trying to find vectors converted by different layers, so it can make some mess, but…
here, we can create a database table with just one layer. So we can see that we have some of them, like the debug and WL structure table, which is actually
Here as well.
And it includes, like, 180 circuits. All of those circuits are from the website that Nicholas already mentioned about. So, all of them are actually written in Open Quasm 2.0, but Kiskit has a way to put
Import them as a 2.0 and export as 3.02, so that, actually, that's what we… what we do in the system to… to have the same version as we… as we support in the… in the pipeline.
So, yeah, for example, let's start with the easiest one, which is the resource profile. So, here we can select as many layers we want. Here we can have a… that's the… that's another thing that's worth to mention. So, when we have selected resource profile, and we click, ingest circuit.
We use,
those circuits that are from the Nicholas website that was mentioned, and we convert that and store to the… to the database and to the file storage, so we can create those tables as we want.
Yeah, so when we have this resource profile, and the resource profile layers is selected here, we have a basic circuit, we can click search.
And we can see… How it actually,
how those embeddings look like. So, for the resource profile, embeddings are built from four dimensions, which means, for example, number of qubits, where maximum is 128. So we take the number of qubits of the circuit, divide by 128, and that's the… that's the number that we
That we use to create embeddings, and similar for other, like, gates, depth, and, number of params.
So, yeah, we can… we can see that most of them, like, for example, the first one, which is not exactly the same, but pretty similar, both of them are using two gates, and one qubit.
But I would say there are… those parameters are different, but it says that it's, like, 100% similar, to the… to the baseline, to the original one.
So, it shows us how that kind of layer works, and…
Actually, for me, it helps me to understand and dig deeper into the codebase to, you know, somehow,
improve that… that layer or so.

**Anya Schukin | 21:46**
Quick question right here. So we've got the… we've got the original circuit on the left, and the similar circuit suggestions on the right. What are the similar circuits being evaluated on? Is it just the CASM code, or is it the number of qubits, gate count.

**Dominik Lasek | 22:00**
For this particular example, we use this circuit and the Qiskit. So, Qiskit gives us the metadata, like, number of qubits, gate, depth, and number of params.
And those information are converted into the embeddings, and those embeddings are stored to the database. And then we want to find a similar one. We do exactly the same
With, once again, those that are already stored in database.
They went through that process, so all of those circuits were converted into the embeddings by those data.
And when we want to try… when we want to find a similar one, we do exactly the same with the… with the circuit on the left. So we've… we create vectors, and then we find the closest vectors in the database for… for them. That's why we…

**Anya Schukin | 22:57**
So it's a… it's a vector nearest neighbor kind of…

**Dominik Lasek | 22:59**
Yep, yep.

**Anya Schukin | 23:00**
Okay, yeah, got it.

**Dominik Lasek | 23:03**
Yeah, Wes?

**Wesley Donaldson | 23:06**
Dom, Nicholas, maybe you want to speak to just kind of our thinking of how this fits into the larger pipeline, the value it brings, the idea of maybe looking at historical processing, applying QMM to a particular circuit, and seeing what those results are, and how that's relevant to a new circuit that we might be testing.

**Dominik Lasek | 23:24**
Yeah, sure. Actually, at the moment, this system is in the process of implementing and testing, debugging, and so on, but it can give us… actually, that's the thing that this system can give us. So, when we have a circuit that we want to run on a…
Tiskit Simulator, or maybe in the real hardware, like IBM, we can,
before we go to the IBM, we can look up our, database.
to find any circuits that were already, run in the, in the past.
And we store all information with results and so on, so we can actually,
It can give us the, we can,
predict before going to IBM, what can we expect by running the circuit in the real hardware, so we can get that information before going there, and it can actually help us to, I don't know, prevent spending money or so.
If that makes sense, I hope it makes sense. Maybe, Nicholas, you can add something more valuable to that.

**Nicolas Berrogorry | 24:41**
I wouldn't say more valuable, but maybe adding some extra comments. I think that what you said is correct, and amongst other possible usages for finding similarities, I think that's
Of course, probably really well thought of, like, previously, because we are, what we're trying to do here is to implement one of the stages of,
the specifications from Chef, which is the prior lookup. The twist that we are adding to this is that we are not doing, a hard, a hard, hash.
on the… on the circuits, we are basically doing a fussy search, which is a term that, that I really like from… that Brian said.
The other thing that this type of system can help with is any model that we want to use, even an LLM, even if we don't train it ourselves, will generalize better when it has more samples.
So, if you're trying to apply some modification to a circuit, and you have a plethora of similar circuits that were already run, as you mentioned, on real hardware, and what we have data for, there is a much higher chance that a model will generalize. Also, for generating new data or variations of circuits.
If we have data about, for example, some user feedback, so not only results, but which circuits were selected by users for different reasons, that can also be used to help generate better variants. And I think that is the whole purpose of the QMN prior lookup. I may be wrong or confusing terms, but that's my understanding so far.
And yeah, that's… that's why I think a system like this, helps.
And the magic will be, I think, on the layer definition, so having this tool that domain is insanely useful.
for developing each individual layer, trying different combinations of these layers, and seeing what gives accurate results. For example, that if we put in an input circuit,
We get, on the output, we get relevant results, and not, like.
random results that we don't want. Like, that's a point that Brian made, like, how do we know that we're not missing results, etc. Well, this test bench should be the place to experiment with that. That's probably not gonna be a perfect solution, but a good solution, and that's
What we should probably aim for.
Yep.

**Jeff Titus | 27:21**
I think with guys, my input on this is that
it's great that you're starting to do this, and I'm looking
forward to understanding how we can make this kind of
Kind of a canonical reference.
For measurements and comparisons.
I think there's more to it than, obviously, just structure and
and various elements that are contained that can be just compared. There's a semantic kind of comparison that we should probably be doing at some point.
As to the intention and type of circuit that's being run.
So, there's an obvious Opportunity here to…
Put more structure into how you're storing things in the data store.
And make sure that that structure, you know, adheres to…
like I said, some sort of semantic reference of some kind, a classification system, you might say.
So when the circuits are input into the data store, that that…
The metadata that's associated with them is what we use
As well as the structure of the circuit itself.
And then also,
I mean, this is an obvious place to potentially bring in insights, not necessarily to rely on, but insights for kind of double checks on comparisons with an LLM, right?
You can go out and say.
You know, we think these are similar, and…
this is why, and maybe the LLM can kind of check your homework or something, or it can help you follow a set of rules to, like, break down scoring or something like that based on, you know, what our data scientists want to do, so…
But this is really a good precedent to start with.
And I wouldn't want to get too deep into this.
Specifics of comparisons and weighting and scoring and stuff until we…
We have more input from the Rubens and Slavas and Sashas.

**Anya Schukin | 29:22**
Also, just a heads up, Jeff, I had a chat with Michael Perlstein, and he said that Sasha's really the best positioned person to go out and test this, so what we'll do is we'll put Slava up ahead to start testing this basically now through April, and then Sasha will be able to step in and
Give him… give it another look once he's freer.

**Jeff Titus | 29:43**
You know, I want to address that. You keep saying test, and I'm a little confused about that.

**Anya Schukin | 29:48**
feedback.

**Jeff Titus | 29:49**
terminology.

**Anya Schukin | 29:50**
Feedback. The… the plan that you shared earlier in the Confluence?
Yeah. So, this is what I'm talking about.

**Jeff Titus | 29:59**
Okay.
Yeah. That's cool.
Yeah, same… definitely interested in that, and I'm glad he can do that. When I was talking to Sasha about availability.
he first said he couldn't do it, and then I was like, but it's only for 2 weeks. He just has to finish up what he's doing on the TQ Chem stuff, but…
I don't know about Slava.
That's on…

**Anya Schukin | 30:20**
I'll circle back with him.

**Jeff Titus | 30:22**
Alexi's side, so…

**Anya Schukin | 30:23**
Yep.

**Jeff Titus | 30:25**
Yeah.
Cool. Yeah, this is really, really great. I can't wait.
I feel like, you know.
There's momentum here, and it's a bummer that we can't have those guys, like, right with us in this
in this call, but it's really great. We can get moving on this. That comparison bit, the logic behind it, the…
Hopefully building some intelligence into it can make this really, really useful.
Cool exploration, guys.

**Dominik Lasek | 30:56**
Thank you so much.

**Nicolas Berrogorry | 30:58**
Thanks.

**Dominik Lasek | 31:00**
Yeah, actually, yeah, actually, that was almost the end of the presentation I have prepared for today, but yeah, there are, like, more layers, so we can check that in a different way, so…
Yeah, but… that's it.
So, yeah, thank you so much.

**Anya Schukin | 31:19**
Awesome, thanks guys, thanks for the demo.
Alright, well, I'm really excited to see what Slava and Sasha have to say over the coming weeks. I think we'll get,
Some pretty interesting insight.
Through them, jeff, anything else to add before we close out?

**Jeff Titus | 31:41**
No, I think time back right now is a good thing.
And appreciate the efforts. Let's just, make sure, I think, that… You know, you guys are…
Buttoning up anything that needs to be buttoned up to make it at least
obvious what's been done. And Anya, I don't know if you've shared any of the recordings that we've done?
I kind of want to make a digest of those, because we have this one, we have other little things where there's been incremental
discussions, learnings, and that sort of thing. Maybe we should put a page together on Confluence, like, here's the most important recordings, or something like that.

**Anya Schukin | 32:20**
Yeah, we could do that.

**Jeff Titus | 32:21**
Yeah. I mean, obviously, I have to go back through them all.
the hell is this? I'll do some of that. I'll try to call out a few that seem pertinent.
Yeah, no, that's it. Thanks, guys. Appreciate it. Have a great day today.

**Nicolas Berrogorry | 32:37**
You too.

**Anya Schukin | 32:38**
Thanks, folks.

**Jessica Rodríguez | 00:00**
Hi, everyone. Bye.
