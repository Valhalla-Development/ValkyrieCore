import { Schema, model } from 'mongoose';

/**
 * Represents an example schema
 */
const Example = new Schema({
    GuildId: { type: String, unique: true },
    ChannelId: { type: String, default: null },
});

export default model('Example', Example, 'Example');
