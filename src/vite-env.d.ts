/// <reference types="vite/client" />

declare namespace mw {
  const config: mw.Map;

  // #region Namespace mw.user (https://doc.wikimedia.org/mediawiki-core/master/js/mw.user.html)
  namespace user {
    const options: mw.Map;
    const tokens: mw.Map;
    function acquireTempUserName(): JQuery.Promise<string>;
    function generateRandomSessionId(): string;
    function getFirstRegistration(): boolean | null | Date;
    function getGroups(
      callback?: (groups: string[]) => void
    ): JQuery.Promise<string[]>;
    function getId(): number;
    function getName(): string | null;
    function getPageviewToken(): string;
    function getRegistration(): boolean | null | Date;
    function getRights(
      callback?: (rights: string[]) => void
    ): JQuery.Promise<string[]>;
    function id(): string;
    function isAnon(): boolean;
    function isNamed(): boolean;
    function isTemp(): boolean;
    function sessionId(): string;
  }

  // #endregion

  // #region Class Map (https://doc.wikimedia.org/mediawiki-core/master/js/mw.Map.html)
  class Map {
    exists(selection: string): boolean;
    get(selection?: string, fallback?: any): any;
    set(selection: string, value?: any): boolean;
  }

  // #endregion

  // #region Class Message (https://doc.wikimedia.org/mediawiki-core/master/js/mw.Message.html)
  class Message {
    constructor(
      map: Record<string, string>,
      key: string,
      ...parameters: string[]
    );

    /**
     * Format message and return as escaped text in HTML.
     */
    escaped(): string;

    /**
     * Check if a message exists.
     */
    exists(): boolean;

    /**
     * Check whether the message contains only syntax supported by jqueryMsg.
     */
    isParseable(): boolean;

    /**
     * Add (does not replace) parameters for $N placeholder values.
     * @returns The updated Message instance.
     */
    params(...parameters: string[]): this;

    /**
     * Parse message as wikitext and return HTML.
     */
    parse(): string;

    /**
     * Parse the message to DOM nodes, rather than an HTML string.
     */
    parseDom(): JQuery;

    /**
     * Return message plainly.
     */
    plain(): string;

    /**
     * Format message with text transformations applied.
     */
    text(): string;
  }

  interface Messages {
    set(messages: Record<string, string>): void;
  }

  const messages: Messages;

  function message(key: string, ...parameters: string[]): Message;
  function msg(key: string, ...parameters: string[]): string;

  // #endregion
}
